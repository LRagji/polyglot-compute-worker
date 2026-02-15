import { IPolyglotWorkerOptions, IWorkerResponse } from "./i-polyglot-worker";

/**
 * A pool for managing polyglot compute workers. This class provides methods to invoke workers with specified options, as well as to clean up resources and manage worker lifecycles.
 */
export class PolyglotComputeWorkerPool {

    public async invoke<RT>(options: IPolyglotWorkerOptions): Promise<IWorkerResponse<RT>> {
        // Implementation would go here for spawning a worker.
        throw new Error("Not implemented");
    }

    public async [Symbol.asyncDispose](): Promise<void> {
        // Implementation would go here for cleaning up all resources and workers.
        throw new Error("Not implemented");
    }

    public async close(workerId: string): Promise<void> {
        // Implementation would go here for gracefully shutting down a specific worker by ID.
        throw new Error("Not implemented");
    }

    public async terminate(workerId: string): Promise<void> {
        // Implementation would go here for forcefully killing a specific worker by ID.
        throw new Error("Not implemented");
    }
}