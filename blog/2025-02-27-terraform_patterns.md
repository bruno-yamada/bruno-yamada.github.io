---
slug: terraform-patterns
title: Terraform Patterns
authors: bruno-yamada
tags: [ terraform ]
---

# Terraform Patterns

## Context

Trying to figure out the best setup for a specific case of a multi-env single-repo, trunk-based setup

<!-- truncate -->

Taking a look today at this post: https://www.resourcely.io/post/10-terraform-config-root-setups

Without looking at the post, I was thinking of something like the 3rd approach `Multi-env setup with shared modules`, or even the 7th with `Monorepo with multiple services`

## Decision

In the end, I chose the following structure:
```
.
├── README.md
├── data.tf
├── envs
│   ├── dev.yaml
│   ├── prod.yaml
│   └── stg.yaml
├── locals.tf
├── provider.tf
├── main.tf
└── variables.tf
```

reason being:
- It allows me to manage the non-sensitive settings for all envs as code in the yaml
- all of the envs will use the same code from root
- for testing changes, I create a branch `feat`, and apply `dev` code from there, once it is validated, I merge it back into `main`, and apply on `stg` and `prod`
    - and delete `feat` branch after merge is complete
- seen similar patterns with a `master` + `develop` branches few times

