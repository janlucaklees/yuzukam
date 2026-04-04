import type { InstanceLifecycleState } from '$types/InstanceLifecycleState';

export default abstract class AbstractSyncLifecycledClass {
	private lifecycleState: InstanceLifecycleState = 'uninitialized';

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

	public initialize(): void {
		if (this.isInitialized()) {
			return;
		}

		if (this.isInitializing()) {
			return;
		}

		if (this.isDestroyed()) {
			throw new Error('Destroyed object cannot be initialized.');
		}

		this.markAsInitializing();

		try {
			this.handleInitialization();

			this.markAsInitialized();
		} catch (error) {
			this.markAsUninitialized();

			throw error;
		}
	}

	protected abstract handleInitialization(): void;

	/*************************************************************************************************
	 * Destruction
	 ************************************************************************************************/

	public isDestroyed(): boolean {
		return this.lifecycleState === 'destroyed';
	}

	private markAsDestroyed(): void {
		this.lifecycleState = 'destroyed';
	}

	public destroy(): void {
		if (this.isDestroyed()) {
			return;
		}

		if (this.isUninitialized()) {
			throw new Error('Uninitialized object cannot be destroyed.');
		}

		if (this.isInitializing()) {
			throw new Error('Initializing object cannot be destroyed.');
		}

		this.handleDestruction();

		this.markAsDestroyed();
	}

	protected abstract handleDestruction(): void;
}

export { type InstanceLifecycleState };
