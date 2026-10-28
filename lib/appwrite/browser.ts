import { Client } from "appwrite";

/** Public values only (endpoint + project ID). No secrets ever reach the browser. */
export const getBrowserClient = () =>
  new Client().setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);