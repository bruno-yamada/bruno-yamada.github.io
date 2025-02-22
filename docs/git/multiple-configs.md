---
sidebar_position: 1
---

# Using multiple configs with git ssh

Scenario: you work for companyA and personal, and want to use different keys and user for each

There are 3 simple steps to take, to allow to both `commit` and `push` with different set of credentials

## 1. Configure your SSH keys

Generate your ssh keys and add the `.pub` file to your settings on github.com
```bash
ssh-keygen -t ed25519 -C "<email>"
```

## 2. Update your commit settings

These settings allows you to dynamically pick user name, email, and signing key
```gitconfig
# ~/.gitconfig

# this enables commit signing
[commit]
	gpgsign = true
[gpg]
	format = ssh

# dynamically load settings
[includeIf "gitdir:~/projects/github.com/companyA/"]
    path = ~/.gitconfig-companyA
[includeIf "gitdir:~/projects/github.com/personal/"]
    path = ~/.gitconfig-personal
```

Then customize your settings for your individual files:

```gitconfig
# ~/.gitconfig-personal
[user]
	name = Bruno R. Yamada
	email = bryamada@gmail.com
	signingkey = ssh-ed25519 A........H3 bryamada@gmail.com # <= .pub of the sining key

```

## 3. SSH Git Push settings

Now configure which SSH keys are used to `push` your code, is easy to configure it globally, but if you need custom per project, I recommend the following:

- Download and Install [direnv](https://github.com/direnv/direnv)
- Create one `.envrc` file per parent folder

eg.
```bash
# ~/projects/github.com/personal/.envrc
export GIT_SSH_COMMAND='ssh -i ~/.ssh/id_bryamada -o IdentitiesOnly=yes'
```

