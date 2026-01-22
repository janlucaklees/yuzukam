export default function determineMediaDevice(
	availableDevices: MediaDeviceInfo[],
	preferredDeviceId: string
): MediaDeviceInfo | undefined {
	// If preferrred device is in list of available devices, just return that device.
	const matchingDevice = availableDevices.find((device) => device.deviceId === preferredDeviceId);
	if (matchingDevice) {
		return matchingDevice;
	}

	// If preferred device is not available, check if only one device is available. If so return it.
	if (availableDevices.length === 1) {
		return availableDevices[0];
	}

	// No preferred device found and multiple devices available? We cannot determine a device.
	return undefined;
}
