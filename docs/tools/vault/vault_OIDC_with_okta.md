# Connecting to Vault using OKTA OIDC

If you ever have to configure OIDC method to connect to vault using Okta, you may find it a bit difficult,
specially when it comes to mapping the groups and claims

This guide was written with the vault-cli in mind, but everything done through vault-cli can be done through terraform too

## Steps

### Step 1: Configure Okta

I'll these steps on a high-level, and won't be adding images

- Create your Okta group(s) through the UI at `Directory > Groups`
  - eg. an `myapp-admin` group and a `myapp-developer` group
- assign admins and developers to groups
- create application at `Applications > Applications`
  - select OIDC aplication
  - in the `Grant Type` section, select "implicit (hybrid)" 
  - Add redirect URIs like: `$VAULT_ADDR/ui/vault/auth/oidc/oidc/callback`
  - To enable CLI authentication add 1 more redirect URI: `http://localhost:8250/oidc/callback`
  - Assignments: select your `myapp-admin` and `myapp-developer` groups (can be updated afterwards)
  - Save
  - go to `Sign On` tab, edit
  - in the Groups claim filter, you have 2 options:
    - add all groups to the claim: use `Matches regex` and `.*` in the value
    - add only myapp groups to the claim: use `Starts with` and `myapp` in the value
  - In the `Okta API Scopes`:
    - Find `okta.groups.read` and `Grant`
    - Find `okta.users.read.self` and `Grant`
- Collect the settings:
  - copy the CLIENT_ID
  - copy the CLIENT_SECRET
  - copy the OKTA_DOMAIN

Expose the values as env vars, to be used with vault-cli

```bash
export OKTA_CLIENT_ID=<CLIENT_ID>
export OKTA_CLIENT_SECRET=<CLIENT_SECRET>
export OKTA_DOMAIN=<OKTA_DOMAIN> # usually https://<my-org>.okta.com
```

Check OIDC details, grab your okta url and open it like: `<okta-org-url>/.well-known/openid-configuration`

### Step 2: Configure Vault

If you want to test it locally first, use this to vault in dev mode on localhost
```
docker run --cap-add=IPC_LOCK \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=root' \
  -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' \
  -e 'VAULT_LOG_LEVEL=debug' \
  -p 8200:8200 vault:1.13.3

export VAULT_ADDR=http://0.0.0.0:8200
export VAULT_TOKEN=root

vault status
```

Now for the configuration steps:

Enable oidc:
```bash
vault auth enable oidc
```

Configure OIDC
```bash
vault write auth/oidc/config \
         oidc_discovery_url="$OKTA_DOMAIN" \
         oidc_client_id="$OKTA_CLIENT_ID" \
         oidc_client_secret="$OKTA_CLIENT_SECRET" \
         oidc_response_mode="form_post" \
         oidc_response_types="id_token"
```

Configure role
```bash
# you can add `verbose_oidc_logging` for verbose logs, to print claim in vault server logs (not cli)
# the block below is
# - creating `myapp-admin` role
# - attaching `myapp-admin` policy to the role
# - bound_claims, restricting access to the role, only if the user has `myapp-admin` as one of the groups assigned to him and present in the claims sent by Okta
vault write auth/oidc/role/myapp-admin -<<EOF
{
  "user_claim": "sub",
  "groups_claim": "groups",
  "bound_audiences": "$OKTA_CLIENT_ID",
  "allowed_redirect_uris": [
    "http://localhost:8250/oidc/callback",
    "$VAULT_ADDR/ui/vault/auth/oidc/oidc/callback",
    "$VAULT_ADDR/v1/auth/oidc/oidc/callback"
  ],
  "role_type": "oidc",
  "policies": "myapp-admin",
  "oidc_scopes": ["openid", "groups"],
  "verbose_oidc_logging": true,
  "bound_claims": {
    "groups": [
      "myapp-admin"
    ]
  }
}
EOF
```

Login
```bash
vault login -method=oidc -role=myapp-admin
```

Details about configuration of the policy is not covered here, you can read more [here](https://developer.hashicorp.com/vault/docs/concepts/policies)

## References

- Official documentation: https://developer.hashicorp.com/vault/api-docs/auth/jwt
- Useful guide for the initial steps, but had to pivot when it came to
  - configuring authorization server, not really necessary in all cases
      - you can use okta's default "org" authorzation server
      - only create a custom when you need to apply custom scopes/claims/policies
      - [read more](https://developer.okta.com/docs/concepts/auth-servers/)
  - configuring vault, to use CLI instead of terraform

