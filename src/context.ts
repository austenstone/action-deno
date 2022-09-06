// Originally pulled from https://github.com/JasonEtco/actions-toolkit/blob/main/src/context.ts
import { WebhookPayload } from './interfaces.ts'
import { existsSync } from "https://deno.land/std@0.144.0/fs/exists.ts";

export class Context {
  /**
   * Webhook payload object that triggered the workflow
   */
  payload: WebhookPayload

  eventName: string | undefined
  sha: string | undefined
  ref: string | undefined
  workflow: string | undefined
  action: string | undefined
  actor: string | undefined
  job: string | undefined
  runNumber: number
  runId: number
  apiUrl: string
  serverUrl: string
  graphqlUrl: string

  /**
   * Hydrate the context from the environment
   */
  constructor() {
    this.payload = {}
    const evenPath = Deno.env.get('GITHUB_EVENT_PATH');
    if (evenPath) {
      if (existsSync(evenPath)) {
        const eventPath = Deno.env.get('GITHUB_EVENT_PATH');
        if (eventPath) {
          const data = Deno.readFileSync(eventPath);
          this.payload = JSON.parse(
            (new TextDecoder("utf-8")).decode(data)
          )
        }
      } else {
        const path = Deno.env.get('GITHUB_EVENT_PATH')
        Deno.stdout.write(new TextEncoder().encode(`GITHUB_EVENT_PATH ${path} does not exist`))
      }
    }
    this.eventName = Deno.env.get('GITHUB_EVENT_NAME as string')
    this.sha = Deno.env.get('GITHUB_SHA as string')
    this.ref = Deno.env.get('GITHUB_REF as string')
    this.workflow = Deno.env.get('GITHUB_WORKFLOW as string')
    this.action = Deno.env.get('GITHUB_ACTION as string')
    this.actor = Deno.env.get('GITHUB_ACTOR as string')
    this.job = Deno.env.get('GITHUB_JOB as string')
    this.runNumber = parseInt(Deno.env.get('GITHUB_RUN_NUMBER') as string, 10)
    this.runId = parseInt(Deno.env.get('GITHUB_RUN_ID') as string, 10)
    this.apiUrl = Deno.env.get('GITHUB_API_URL') ?? `https://api.github.com`
    this.serverUrl = Deno.env.get('GITHUB_SERVER_URL') ?? `https://github.com`
    this.graphqlUrl =
      Deno.env.get('GITHUB_GRAPHQL_URL') ?? `https://api.github.com/graphql`
  }

  get issue(): {owner: string; repo: string; number: number} {
    const payload = this.payload

    return {
      ...this.repo,
      number: (payload.issue || payload.pull_request || payload).number
    }
  }

  get repo(): {owner: string; repo: string} {
    if (Deno.env.get('GITHUB_REPOSITORY')) {
      const ownerRepo = Deno.env.get('GITHUB_REPOSITORY');
      if (ownerRepo) {
        const [owner, repo] = ownerRepo.split('/')
        return {owner, repo}
      }
    }

    if (this.payload.repository) {
      return {
        owner: this.payload.repository.owner.login,
        repo: this.payload.repository.name
      }
    }

    throw new Error(
      "context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
    )
  }
}