/**
 * BATTERY STATUS SERVICE
 * Theo dõi mức pin và trạng thái sạc của thiết bị theo thời gian thực (0 VNĐ).
 * Tự động đồng bộ sang máy đối phương khi cắm sạc hoặc % pin thay đổi.
 */

let batteryManager = null;

export async function initBatteryMonitoring(onBatteryChange) {
  if (typeof navigator !== 'undefined' && typeof navigator.getBattery === 'function') {
    try {
      batteryManager = await navigator.getBattery();
      const notify = () => {
        onBatteryChange({
          level: Math.round(batteryManager.level * 100),
          charging: batteryManager.charging
        });
      };

      batteryManager.addEventListener('levelchange', notify);
      batteryManager.addEventListener('chargingchange', notify);

      // Phát thông báo ngay lập tức mức pin hiện tại
      notify();

      return () => {
        if (batteryManager) {
          batteryManager.removeEventListener('levelchange', notify);
          batteryManager.removeEventListener('chargingchange', notify);
        }
      };
    } catch (e) {
      console.warn('Battery status not accessible:', e);
    }
  }
  return () => {};
}

export async function getCurrentBattery() {
  if (typeof navigator !== 'undefined' && typeof navigator.getBattery === 'function') {
    try {
      const b = await navigator.getBattery();
      return {
        level: Math.round(b.level * 100),
        charging: b.charging
      };
    } catch (e) {}
  }
  return null;
}
