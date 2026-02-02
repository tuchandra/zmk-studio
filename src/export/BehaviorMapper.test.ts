/**
 * Unit tests for BehaviorMapper
 *
 * THESE ARE REAL TESTS with automated assertions
 */

import { describe, it, expect } from 'vitest';
import { BehaviorMapper } from './BehaviorMapper';

// Mock HID key name function
const mockGetKeyName = (hidUsage: number): string | null => {
  const keyMap: Record<number, string> = {
    0x04: 'Q',
    0x1A: 'W',
    0x08: 'E',
    0x2C: 'SPACE',
    0xE0: 'LCTRL',
    0x2B: 'TAB',
  };
  return keyMap[hidUsage] || null;
};

describe('BehaviorMapper', () => {
  describe('formatBinding', () => {
    it('should format transparent binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 0, param1: 0, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&trans');
    });

    it('should format key press binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 1, param1: 0x04, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&kp Q');
    });

    it('should format mod-tap binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 2, param1: 0xE0, param2: 0x04, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&mt LCTRL Q');
    });

    it('should format layer-tap binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 3, param1: 1, param2: 0x2B, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&lt 1 TAB');
    });

    it('should format momentary layer binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 4, param1: 1, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&mo 1');
    });

    it('should format toggle layer binding', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 5, param1: 2, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&tog 2');
    });

    it('should handle unknown behavior', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 999, param1: 0, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('/* Unknown behavior 999 */');
    });

    it('should handle unknown HID key code', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 1, param1: 0xFF, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&kp /* HID 0xff */');
    });
  });

  describe('getBehavior', () => {
    it('should return behavior for valid ID', () => {
      const behavior = BehaviorMapper.getBehavior(1);
      expect(behavior).not.toBeNull();
      expect(behavior?.code).toBe('kp');
      expect(behavior?.displayName).toBe('Key Press');
    });

    it('should return null for invalid ID', () => {
      const behavior = BehaviorMapper.getBehavior(999);
      expect(behavior).toBeNull();
    });
  });

  describe('isLayerBehavior', () => {
    it('should return true for layer-tap', () => {
      expect(BehaviorMapper.isLayerBehavior(3)).toBe(true);
    });

    it('should return true for momentary layer', () => {
      expect(BehaviorMapper.isLayerBehavior(4)).toBe(true);
    });

    it('should return true for toggle layer', () => {
      expect(BehaviorMapper.isLayerBehavior(5)).toBe(true);
    });

    it('should return false for key press', () => {
      expect(BehaviorMapper.isLayerBehavior(1)).toBe(false);
    });

    it('should return false for mod-tap', () => {
      expect(BehaviorMapper.isLayerBehavior(2)).toBe(false);
    });
  });

  describe('getParamCount', () => {
    it('should return 0 for transparent', () => {
      expect(BehaviorMapper.getParamCount(0)).toBe(0);
    });

    it('should return 1 for key press', () => {
      expect(BehaviorMapper.getParamCount(1)).toBe(1);
    });

    it('should return 2 for mod-tap', () => {
      expect(BehaviorMapper.getParamCount(2)).toBe(2);
    });

    it('should return 2 for layer-tap', () => {
      expect(BehaviorMapper.getParamCount(3)).toBe(2);
    });

    it('should return 0 for unknown behavior', () => {
      expect(BehaviorMapper.getParamCount(999)).toBe(0);
    });
  });

  describe('getBehaviorCode', () => {
    it('should return behavior code for valid ID', () => {
      expect(BehaviorMapper.getBehaviorCode(0)).toBe('trans');
      expect(BehaviorMapper.getBehaviorCode(1)).toBe('kp');
      expect(BehaviorMapper.getBehaviorCode(2)).toBe('mt');
      expect(BehaviorMapper.getBehaviorCode(3)).toBe('lt');
      expect(BehaviorMapper.getBehaviorCode(4)).toBe('mo');
      expect(BehaviorMapper.getBehaviorCode(5)).toBe('tog');
      expect(BehaviorMapper.getBehaviorCode(6)).toBe('bt');
    });

    it('should return null for invalid ID', () => {
      expect(BehaviorMapper.getBehaviorCode(999)).toBeNull();
    });
  });

  describe('getAllBehaviors', () => {
    it('should return map of all known behaviors', () => {
      const behaviors = BehaviorMapper.getAllBehaviors();

      expect(behaviors).toBeInstanceOf(Map);
      expect(behaviors.size).toBeGreaterThan(0);

      // Should have all standard behaviors
      expect(behaviors.has(0)).toBe(true); // trans
      expect(behaviors.has(1)).toBe(true); // kp
      expect(behaviors.has(2)).toBe(true); // mt
      expect(behaviors.has(3)).toBe(true); // lt
      expect(behaviors.has(4)).toBe(true); // mo
      expect(behaviors.has(5)).toBe(true); // tog
      expect(behaviors.has(6)).toBe(true); // bt
    });

    it('should return a new Map instance (not reference)', () => {
      const behaviors1 = BehaviorMapper.getAllBehaviors();
      const behaviors2 = BehaviorMapper.getAllBehaviors();

      // Should be different instances
      expect(behaviors1).not.toBe(behaviors2);

      // But have same content
      expect(behaviors1.size).toBe(behaviors2.size);
    });
  });

  describe('bluetooth behavior', () => {
    it('should format bluetooth binding with numeric param', () => {
      const result = BehaviorMapper.formatBinding(
        { behaviorId: 6, param1: 0, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result).toBe('&bt 0');
    });

    it('should format bluetooth binding with different commands', () => {
      const result1 = BehaviorMapper.formatBinding(
        { behaviorId: 6, param1: 1, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result1).toBe('&bt 1');

      const result2 = BehaviorMapper.formatBinding(
        { behaviorId: 6, param1: 2, param2: null, position: 0 },
        mockGetKeyName
      );
      expect(result2).toBe('&bt 2');
    });
  });

  // ============================================================================
  // Dynamic Behavior Registry Tests (for real keyboard behavior IDs)
  // ============================================================================
  describe('formatBindingWithRegistry', () => {
    // Simulates a real keyboard's behavior registry where IDs don't match hardcoded values
    // This is what keyboards like "Toucan" actually send
    const mockBehaviorRegistry = new Map([
      [8, { id: 8, displayName: 'Key Press', metadata: [] }],
      [13, { id: 13, displayName: 'Layer-Tap', metadata: [] }],
      [14, { id: 14, displayName: 'Mod-Tap', metadata: [] }],
      [22, { id: 22, displayName: 'Momentary Layer', metadata: [] }],
      [23, { id: 23, displayName: 'None', metadata: [] }],
      [25, { id: 25, displayName: 'Toggle Layer', metadata: [] }],
      [30, { id: 30, displayName: 'Bluetooth', metadata: [] }],
      [99, { id: 99, displayName: 'Transparent', metadata: [] }],
    ]);

    it('should format key press with non-standard behavior ID', () => {
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 8, param1: 0x04, param2: null, position: 0 },
        mockGetKeyName,
        mockBehaviorRegistry
      );
      expect(result).toBe('&kp Q');
    });

    it('should format layer-tap with non-standard behavior ID', () => {
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 13, param1: 1, param2: 0x2B, position: 0 },
        mockGetKeyName,
        mockBehaviorRegistry
      );
      expect(result).toBe('&lt 1 TAB');
    });

    it('should format mod-tap with non-standard behavior ID', () => {
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 14, param1: 0xE0, param2: 0x04, position: 0 },
        mockGetKeyName,
        mockBehaviorRegistry
      );
      expect(result).toBe('&mt LCTRL Q');
    });

    it('should format momentary layer with non-standard behavior ID', () => {
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 22, param1: 2, param2: null, position: 0 },
        mockGetKeyName,
        mockBehaviorRegistry
      );
      expect(result).toBe('&mo 2');
    });

    it('should format none as &none', () => {
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 23, param1: 0, param2: null, position: 0 },
        mockGetKeyName,
        mockBehaviorRegistry
      );
      expect(result).toBe('&none');
    });

    it('should format toggle layer with non-standard behavior ID', () => {
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 25, param1: 3, param2: null, position: 0 },
        mockGetKeyName,
        mockBehaviorRegistry
      );
      expect(result).toBe('&tog 3');
    });

    it('should format bluetooth with non-standard behavior ID', () => {
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 30, param1: 1, param2: null, position: 0 },
        mockGetKeyName,
        mockBehaviorRegistry
      );
      expect(result).toBe('&bt 1');
    });

    it('should format transparent with non-standard behavior ID', () => {
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 99, param1: 0, param2: null, position: 0 },
        mockGetKeyName,
        mockBehaviorRegistry
      );
      expect(result).toBe('&trans');
    });

    it('should return unknown comment for behavior ID not in registry', () => {
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 999, param1: 0, param2: null, position: 0 },
        mockGetKeyName,
        mockBehaviorRegistry
      );
      expect(result).toBe('/* Unknown behavior 999 */');
    });

    it('should return unknown comment for unrecognized displayName', () => {
      const registryWithUnknown = new Map([
        [50, { id: 50, displayName: 'Custom Macro XYZ', metadata: [] }],
      ]);
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 50, param1: 0, param2: null, position: 0 },
        mockGetKeyName,
        registryWithUnknown
      );
      expect(result).toBe('/* Unknown behavior: Custom Macro XYZ (id=50) */');
    });

    it('should fall back to hardcoded behaviors when registry is empty', () => {
      const emptyRegistry = new Map();
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 1, param1: 0x04, param2: null, position: 0 },
        mockGetKeyName,
        emptyRegistry
      );
      expect(result).toBe('&kp Q');
    });
  });

  describe('getBehaviorCodeFromDisplayName', () => {
    it('should map "Key Press" to "kp"', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('Key Press')).toBe('kp');
    });

    it('should map "Mod-Tap" to "mt"', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('Mod-Tap')).toBe('mt');
    });

    it('should map "Layer-Tap" to "lt"', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('Layer-Tap')).toBe('lt');
    });

    it('should map "Momentary Layer" to "mo"', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('Momentary Layer')).toBe('mo');
    });

    it('should map "Toggle Layer" to "tog"', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('Toggle Layer')).toBe('tog');
    });

    it('should map "Transparent" to "trans"', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('Transparent')).toBe('trans');
    });

    it('should map "None" to "none"', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('None')).toBe('none');
    });

    it('should map "Bluetooth" to "bt"', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('Bluetooth')).toBe('bt');
    });

    it('should return null for unrecognized display name', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('Custom Unknown')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('key press')).toBe('kp');
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('KEY PRESS')).toBe('kp');
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('MOD-TAP')).toBe('mt');
    });
  });

  describe('getParamCountFromDisplayName', () => {
    it('should return 0 for Transparent', () => {
      expect(BehaviorMapper.getParamCountFromDisplayName('Transparent')).toBe(0);
    });

    it('should return 0 for None', () => {
      expect(BehaviorMapper.getParamCountFromDisplayName('None')).toBe(0);
    });

    it('should return 1 for Key Press', () => {
      expect(BehaviorMapper.getParamCountFromDisplayName('Key Press')).toBe(1);
    });

    it('should return 1 for Momentary Layer', () => {
      expect(BehaviorMapper.getParamCountFromDisplayName('Momentary Layer')).toBe(1);
    });

    it('should return 2 for Mod-Tap', () => {
      expect(BehaviorMapper.getParamCountFromDisplayName('Mod-Tap')).toBe(2);
    });

    it('should return 2 for Layer-Tap', () => {
      expect(BehaviorMapper.getParamCountFromDisplayName('Layer-Tap')).toBe(2);
    });

    it('should return 0 for unknown display name', () => {
      expect(BehaviorMapper.getParamCountFromDisplayName('Unknown Behavior')).toBe(0);
    });
  });

  // ============================================================================
  // Modified Key Tests (keys with modifier flags in HID usage)
  // ============================================================================
  describe('formatBindingWithRegistry with modified keys', () => {
    // Helper to create extended HID usage with modifiers
    const hidMod = (modifiers: number, page: number, id: number) =>
      ((modifiers & 0xFF) << 24) | ((page & 0xFF) << 16) | (id & 0xFFFF);

    const KB = 0x07; // Keyboard page

    const mockRegistry = new Map([
      [8, { id: 8, displayName: 'Key Press', metadata: [] }],
    ]);

    // Mock that handles modified keys
    const mockGetKeyNameWithModifiers = (hidUsage: number): string | null => {
      // Import HidMapper to use getZmkKeyNameWithModifiers
      // For testing, we'll simulate the expected behavior
      const modifiers = (hidUsage >>> 24) & 0xFF;
      const page = (hidUsage >>> 16) & 0xFF;
      const id = hidUsage & 0xFFFF;

      if (page !== 0x07) return null;

      const baseKeys: Record<number, string> = {
        0x04: 'A',
        0x09: 'F',
        0x1D: 'Z',
        0x68: 'F13',
      };

      const keyName = baseKeys[id];
      if (!keyName) return null;

      if (modifiers === 0) return keyName;

      const parts: string[] = [];
      if (modifiers & 0x01) parts.push('LC(');
      if (modifiers & 0x02) parts.push('LS(');
      if (modifiers & 0x04) parts.push('LA(');
      if (modifiers & 0x08) parts.push('LG(');
      if (modifiers & 0x10) parts.push('RC(');
      if (modifiers & 0x20) parts.push('RS(');
      if (modifiers & 0x40) parts.push('RA(');
      if (modifiers & 0x80) parts.push('RG(');

      let count = 0;
      let m = modifiers;
      while (m) { count += m & 1; m >>>= 1; }

      return `${parts.join('')}${keyName}${')'.repeat(count)}`;
    };

    it('should format key press with LA modifier (Alt+F13)', () => {
      const usage = hidMod(0x04, KB, 0x68); // LA + F13
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 8, param1: usage, param2: null, position: 0 },
        mockGetKeyNameWithModifiers,
        mockRegistry
      );
      expect(result).toBe('&kp LA(F13)');
    });

    it('should format key press with LG modifier (GUI+Z)', () => {
      const usage = hidMod(0x08, KB, 0x1D); // LG + Z
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 8, param1: usage, param2: null, position: 0 },
        mockGetKeyNameWithModifiers,
        mockRegistry
      );
      expect(result).toBe('&kp LG(Z)');
    });

    it('should format key press with Hyper modifier (LC+LS+LA+LG+F)', () => {
      const usage = hidMod(0x0F, KB, 0x09); // LC+LS+LA+LG + F
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 8, param1: usage, param2: null, position: 0 },
        mockGetKeyNameWithModifiers,
        mockRegistry
      );
      expect(result).toBe('&kp LC(LS(LA(LG(F))))');
    });

    it('should format key press with LC+LA modifier (Ctrl+Alt+A)', () => {
      const usage = hidMod(0x05, KB, 0x04); // LC + LA + A
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 8, param1: usage, param2: null, position: 0 },
        mockGetKeyNameWithModifiers,
        mockRegistry
      );
      expect(result).toBe('&kp LC(LA(A))');
    });

    it('should format plain key without modifiers', () => {
      const usage = (KB << 16) | 0x04; // Just A, no modifiers
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 8, param1: usage, param2: null, position: 0 },
        mockGetKeyNameWithModifiers,
        mockRegistry
      );
      expect(result).toBe('&kp A');
    });
  });

  // ============================================================================
  // Studio Unlock Behavior Tests
  // ============================================================================
  // Studio Unlock is a ZMK Studio-specific behavior that unlocks the keyboard
  // for configuration. It's not a real keymap action, so it should export as
  // a special placeholder that preserves position without creating invalid syntax.
  describe('Studio Unlock behavior', () => {
    const registryWithStudioUnlock = new Map([
      [8, { id: 8, displayName: 'Key Press', metadata: [] }],
      [23, { id: 23, displayName: 'Studio Unlock', metadata: [] }],
    ]);

    it('should export Studio Unlock as &studio_unlock', () => {
      const result = BehaviorMapper.formatBindingWithRegistry(
        { behaviorId: 23, param1: 0, param2: null, position: 0 },
        mockGetKeyName,
        registryWithStudioUnlock
      );
      expect(result).toBe('&studio_unlock');
    });

    it('should map "Studio Unlock" display name to studio_unlock code', () => {
      expect(BehaviorMapper.getBehaviorCodeFromDisplayName('Studio Unlock')).toBe('studio_unlock');
    });

    it('should return paramCount 0 for Studio Unlock', () => {
      expect(BehaviorMapper.getParamCountFromDisplayName('Studio Unlock')).toBe(0);
    });
  });
});
