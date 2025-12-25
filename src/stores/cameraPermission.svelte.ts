const cameraPermission = $state<{ state: PermissionState }>({ state: 'prompt' });

const permissionStatus = await navigator.permissions.query({ name: 'camera' });

cameraPermission.state = permissionStatus.state;

permissionStatus.addEventListener('change', () => {
	cameraPermission.state = permissionStatus.state;
});

export default cameraPermission;
