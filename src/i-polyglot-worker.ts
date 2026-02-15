/**
 * Interfaces used to spawn and manage cross-language workers.
 *
 * These interfaces describe the options required to launch a worker that
 * may be stateful or stateless, command-line parameters, default unix
 * socket path for IPC, and cleanup hooks required by the runtime.
 */

export type WorkerMode = 'stateful' | 'stateless';

/**
 * Options for spawning a cross-language worker.
 */
export interface IPolyglotWorkerOptions {

  /**
   * Optional identifier for the spawned worker. If omitted, caller may
   * generate one (for logs/tracking).
   */
  id?: string;

  /**
   * Mode of the spawned worker — either `stateful` or `stateless`.
   */
  mode: WorkerMode;

  /**
   * The executable (command) of the worker to run, e.g. `python3`, `node`, or path to
   * a binary.
   */
  command: string;

  /**
   * Arguments passed to the command (in order).
   */
  args?: string[];

  /**
   * Optional environment context for the spawned worker. Values should
   * be strings.
   */
  environmentContext?: Record<string, string>;

  /**
   * Working directory for the spawned worker. If omitted, the current
   * working directory of the launcher will be used.
   */
  workingDirectory?: string;

  /**
   * Explicit socket path to use instead of the default.
   */
  socketPath?: string;

  /**
   * Optional timeout in milliseconds within which the worker must complete the task not available in stateless mode.
   */
  timeoutMs?: number;

  /**
   * Optional output sink for the launched worker (useful in tests or when wiring logs to host process streams).
   */
  outputStream?: NodeJS.WritableStream | null;

  /**
   * Optional error sink for the launched worker (useful in tests or when wiring logs to host process streams).
   */
  errorStream?: NodeJS.WritableStream | null;
}

/**
 * Response from a worker invocation, including the return value, timing information, and metadata about the worker's state.
 */
export interface IWorkerResponse<RT> {
  /**
   * Optional identifier for the spawned worker. If omitted, caller may
   * generate one (for logs/tracking).
   */
  id: string;

  /**
   * The return value of the worker invocation.
   */
  returnValue: RT;

  /**
   * Indicates whether the worker invocation resulted in a timeout (if a timeout was specified).
   */
  timedOut: boolean;

  /**
   * Elapsed time in milliseconds for the worker invocation (from start to completion or timeout).
   */
  elapsedTimeMs: number;

  /**
   * Indicates whether the worker is currently dormant in the pool (i.e., available for reuse). This can be used by callers to decide whether to keep the worker alive for future tasks or to dispose of it.
   */
  dormantInPool: boolean;

  /**
   * Optional additional metadata about the worker or invocation that may be useful for logging, debugging, or monitoring purposes.
   */
  systemInfo?: Record<string, any>;
}