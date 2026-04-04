type InstanceLifecycleState =
	| 'uninitialized'
	| 'initializing'
	| 'initialization-failed'
	| 'initialized'
	| 'destroyed';

export { type InstanceLifecycleState };
