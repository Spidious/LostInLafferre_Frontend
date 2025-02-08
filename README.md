This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

### Running With Docker

The project is using docker compose. Having this installed is a requirement unless you choose to run it uncontainerized. *Instructions Below*

To run the project locally in a container, simply run the following command.
`docker compose --profile <profile_name> up --build   # Available profiles are 'local'/'remote'`

You can also choose to run the container pulling from any specified branch by using
`BRANCH=<branch>   # Default is 'dev'`

EXAMPLES:

```bash
# launch the container using 'remote' settings pulling from the 'main' branch
BRANCH=main docker compose --profile remote up --build
```

*You can also choose to keep these settings in a .env file. Use the --env-file flag for docker compose to enable this.*

#### What are the differences between remote / local modes:

**Local:** Meant for running containers on your local machine. Update files using the local `lost_in_laff` folder to see the changes reflected in the container.
**Remote:** Meant for being run and forgotten. Run the container using this setting and it will continuously fetch from the specified branch. Nodemon keeps the server up to date. Update the files by pushing to the specified branch.

### Running Without Docker

Use the following to run the server uncontainerized from within the `lost_in_laff` directory:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
---------------------------------------------------------------

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
*If running using a local container, you will have to re-launch the container.
I hope to have the container automatically update based on local changes soon.*

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
