import type { InstanceLifecycleState } from '$types/InstanceLifecycleState';

export default abstract class AbstractAsyncLifecycledClass {
	private lifecycleState: InstanceLifecycleState = 'uninitialized';

	private initializationPromise: Promise<void> | undefined;

	/*************************************************************************************************
	 * Initialization
	 ************************************************************************************************/

	public isUninitialized(): boolean {
		return this.lifecycleState === 'uninitialized';
	}

	private markAsUninitialized(): void {
		this.lifecycleState = 'uninitialized';
	}

	public isInitializing(): boolean {
		return this.lifecycleState === 'initializing';
	}

	private markAsInitializing(): void {
		this.lifecycleState = 'initializing';
	}

	public isInitialized(): boolean {
		return this.lifecycleState === 'initialized';
	}

	private markAsInitialized(): void {
		this.lifecycleState = 'initialized';
	}

	public isInitializationFailed(): boolean {
		return this.lifecycleState === 'initialization-failed';
	}

	private markAsInitializationFailed(): void {
		this.lifecycleState = 'initialization-failed';
	}

	public async initialize(): Promise<void> {
		if (this.isInitialized()) {
			return;
		}

		if (this.isInitializing()) {
			return this.initializationPromise;
		}

		if (this.isDestroyed()) {
			throw new Error('Destroyed object cannot be initialized.');
		}

		this.markAsInitializing();

		try {
			this.initializationPromise = this.handleInitialization();

			await this.initializationPromise;

			this.markAsInitialized();
		} catch (error) {
			this.markAsInitializationFailed();

			throw error;
		} finally {
			this.initializationPromise = undefined;
		}
	}

	protected abstract handleInitialization(): Promise<void>;

	/*************************************************************************************************
	 * Destruction
	 ************************************************************************************************/

	public isDestroyed(): boolean {
		return this.lifecycleState === 'destroyed';
	}

	private markAsDestroyed(): void {
		this.lifecycleState = 'destroyed';
	}

	public async destroy(): Promise<void> {
		if (this.isDestroyed()) {
			return;
		}

		if (this.isInitializing()) {
			await this.initializationPromise?.catch(() => {});
		}

		this.handleDestruction();

		this.markAsDestroyed();
	}

	protected abstract handleDestruction(): void;
}

export { type InstanceLifecycleState };
