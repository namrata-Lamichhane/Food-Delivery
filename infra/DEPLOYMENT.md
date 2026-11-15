# AWS EC2 deployment

This deployment uses CloudFormation for the EC2 host, a generated EC2 key stored
by AWS in Systems Manager Parameter Store, and GitHub Actions for builds and
deployment. The customer app is served at `/`, the admin app at `/admin/`, and
the API at `/api/`.

## One-time setup

1. Confirm the GitHub repository can be cloned over HTTPS from a new instance.
   The template defaults to this repository's public GitHub URL. If it is
   private, the bootstrap clone needs a separate GitHub authentication design.
   Ensure the selected AWS region has its default VPC, which this template uses
   for the instance and security group.
2. In GitHub **Settings → Secrets and variables → Actions**, add these
   repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (required for VocLabs/Learner Lab temporary credentials)
   - `MONGODB_URI`
   - `JWT_SECRET`
3. Optionally add the repository variable `AWS_REGION` with the region of the
   VocLabs lab. If it is not set, the workflow defaults to `us-east-1`. The EC2
   key pair, instance, and stack must all be created in this region.
4. Ensure the credentials used by Actions can deploy the stack and read its
   outputs, and can call `ssm:GetParameter` with decryption for
   `/ec2/keypair/*`. Key-pair creation and standard CloudFormation/EC2 actions
   must also be permitted.

## Deploy

Push to `main` or run **Actions → Deploy Food Delivery → Run workflow**. The
`build` job compiles both Vite apps and uploads their `dist` artifacts. The
`deploy` job then:

1. Applies `infra/ec2-instance.yaml` as the `food-delivery` stack with a
   `t2.micro` instance and Ubuntu 24.04.
2. Reads `PublicIP` and `SSMKeyPath` from the stack outputs, downloads the
   generated private key from Parameter Store to the temporary runner, and
   removes that file at the end of the job.
3. Copies both build artifacts to the Nginx document roots and connects with
   SSH to pull the latest backend, write `backend/.env`, install production
   dependencies, restart PM2, and check the API.

After a successful first deployment, `PublicURL` is available in the
CloudFormation stack outputs. The old `EC2_HOST` and `EC2_SSH_KEY` secrets are
no longer used and can be removed.

## Lab credentials and operational notes

The EC2 address and SSH key no longer need manual GitHub secret updates.
VocLabs/Learner Lab AWS credentials are still temporary, however: when the lab
issues a new access key, secret key, or session token, update the corresponding
GitHub secrets before the next deployment. An expired AWS session cannot
authorize CloudFormation or Parameter Store calls.

SSH ingress defaults to `0.0.0.0/0` so GitHub-hosted runners can connect despite
their changing addresses. Restrict `AllowedSSHCidr` when using a fixed,
trusted runner/network. Keep MongoDB and JWT values only in GitHub Secrets;
the workflow writes them to the instance's ignored `backend/.env` file.

This is a low-cost single-instance setup, not a highly available service.
Instance replacement also replaces its local disk, including food images
uploaded at runtime; back up or move runtime uploads to durable storage before
relying on them as persistent user data.
