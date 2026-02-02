/**
 * Unit tests for KeymapGenerator
 *
 * Tests DeviceTree .keymap file generation
 */

import { describe, it, expect } from 'vitest';
import { KeymapGenerator } from './KeymapGenerator';
import type { Keymap, Layer } from './types';

describe('KeymapGenerator', () => {
  // Sample test data
  const sampleLayers: Layer[] = [
    {
      id: 0,
      label: 'Default',
      bindings: [
        { behaviorId: 1, param1: (0x07 << 16) + 0x04, param2: null, position: 0 }, // &kp A
        { behaviorId: 1, param1: (0x07 << 16) + 0x05, param2: null, position: 1 }, // &kp B
        { behaviorId: 0, param1: 0, param2: null, position: 2 }, // &trans
      ],
    },
    {
      id: 1,
      label: 'Lower',
      bindings: [
        { behaviorId: 1, param1: (0x07 << 16) + 0x1E, param2: null, position: 0 }, // &kp N1
        { behaviorId: 1, param1: (0x07 << 16) + 0x1F, param2: null, position: 1 }, // &kp N2
        { behaviorId: 4, param1: 0, param2: null, position: 2 }, // &mo 0
      ],
    },
  ];

  const sampleKeymap: Keymap = {
    layers: sampleLayers,
    deviceName: 'test-keyboard',
    timestamp: new Date('2025-11-09T10:00:00Z'),
    version: '1.0.0',
    totalBindings: 6,
  };

  describe('generate', () => {
    it('should generate complete .keymap file', () => {
      const result = KeymapGenerator.generate(sampleKeymap);

      // Should contain metadata
      expect(result).toContain('Exported from ZMK Studio');
      expect(result).toContain('Date: 2025-11-09T10:00:00.000Z');
      expect(result).toContain('Device: test-keyboard');
      expect(result).toContain('Version: 1.0.0');
      expect(result).toContain('Layers: 2');

      // Should contain includes
      expect(result).toContain('#include <behaviors.dtsi>');
      expect(result).toContain('#include <dt-bindings/zmk/keys.h>');
      expect(result).toContain('#include <dt-bindings/zmk/bt.h>');

      // Should contain layer constants
      expect(result).toContain('#define DEFAULT 0');
      expect(result).toContain('#define LOWER 1');

      // Should contain keymap structure
      expect(result).toContain('/ {');
      expect(result).toContain('keymap {');
      expect(result).toContain('compatible = "zmk,keymap";');

      // Should contain layer definitions
      expect(result).toContain('default_layer {');
      expect(result).toContain('label = "Default";');
      expect(result).toContain('lower_layer {');
      expect(result).toContain('label = "Lower";');

      // Should contain footer
      expect(result).toContain('This export does not include:');
      expect(result).toContain('Combos');
      expect(result).toContain('Macros');
    });

    it('should generate valid DeviceTree syntax', () => {
      const result = KeymapGenerator.generate(sampleKeymap);

      // Check for proper structure
      expect(result).toMatch(/\/ \{[\s\S]*keymap \{[\s\S]*\};\s*\};/);
    });
  });

  describe('generateMetadata', () => {
    it('should generate metadata comment block', () => {
      const metadata = {
        timestamp: '2025-11-09T10:00:00.000Z',
        deviceName: 'corne',
        version: '1.0.0',
        layerCount: 3,
      };

      const result = KeymapGenerator.generateMetadata(metadata);

      expect(result).toContain('/*');
      expect(result).toContain('*/');
      expect(result).toContain('Exported from ZMK Studio');
      expect(result).toContain('Date: 2025-11-09T10:00:00.000Z');
      expect(result).toContain('Device: corne');
      expect(result).toContain('Version: 1.0.0');
      expect(result).toContain('Layers: 3');
    });
  });

  describe('generateIncludes', () => {
    it('should generate standard ZMK include directives', () => {
      const result = KeymapGenerator.generateIncludes();

      expect(result).toContain('#include <behaviors.dtsi>');
      expect(result).toContain('#include <dt-bindings/zmk/keys.h>');
      expect(result).toContain('#include <dt-bindings/zmk/bt.h>');
    });
  });

  describe('generateLayerConstants', () => {
    it('should generate #define statements for layers', () => {
      const result = KeymapGenerator.generateLayerConstants(sampleLayers);

      expect(result).toContain('#define DEFAULT 0');
      expect(result).toContain('#define LOWER 1');
    });

    it('should handle layer labels with spaces and special characters', () => {
      const layers: Layer[] = [
        { id: 0, label: 'Default Layer', bindings: [] },
        { id: 1, label: 'Symbols & Numbers', bindings: [] },
        { id: 2, label: 'NAV/Media', bindings: [] },
      ];

      const result = KeymapGenerator.generateLayerConstants(layers);

      expect(result).toContain('#define DEFAULT_LAYER 0');
      expect(result).toContain('#define SYMBOLS_NUMBERS 1');
      expect(result).toContain('#define NAV_MEDIA 2');
    });

    it('should handle empty layer list', () => {
      const result = KeymapGenerator.generateLayerConstants([]);

      expect(result).toBe('');
    });
  });

  describe('generateKeymap', () => {
    it('should generate keymap DeviceTree structure', () => {
      const result = KeymapGenerator.generateKeymap(sampleLayers);

      expect(result).toContain('/ {');
      expect(result).toContain('keymap {');
      expect(result).toContain('compatible = "zmk,keymap";');
      expect(result).toContain('default_layer {');
      expect(result).toContain('lower_layer {');
      expect(result).toContain('};');
    });
  });

  describe('generateLayer', () => {
    it('should generate layer with label and bindings', () => {
      const layer: Layer = {
        id: 0,
        label: 'Test',
        bindings: [
          { behaviorId: 1, param1: (0x07 << 16) + 0x04, param2: null, position: 0 }, // &kp A
          { behaviorId: 0, param1: 0, param2: null, position: 1 }, // &trans
        ],
      };

      const result = KeymapGenerator.generateLayer(layer);

      expect(result).toContain('test_layer {');
      expect(result).toContain('label = "Test";');
      expect(result).toContain('bindings = <');
      expect(result).toContain('&kp A');
      expect(result).toContain('&trans');
      expect(result).toContain('>;');
    });

    it('should format bindings in rows', () => {
      const layer: Layer = {
        id: 0,
        label: 'Full',
        bindings: Array.from({ length: 12 }, (_, i) => ({
          behaviorId: 0,
          param1: 0,
          param2: null,
          position: i,
        })),
      };

      const result = KeymapGenerator.generateLayer(layer);

      // Should have multiple rows (6 bindings per row)
      const bindingLines = result.split('\n').filter(line => line.includes('&trans'));
      expect(bindingLines.length).toBe(2); // 12 bindings / 6 per row = 2 rows
    });

    it('should handle layer labels with special characters', () => {
      const layer: Layer = {
        id: 0,
        label: 'Navigation & Media',
        bindings: [{ behaviorId: 0, param1: 0, param2: null, position: 0 }],
      };

      const result = KeymapGenerator.generateLayer(layer);

      expect(result).toContain('navigation_media_layer {');
      expect(result).toContain('label = "Navigation & Media";');
    });
  });

  describe('generateFooter', () => {
    it('should generate footer with limitation notes', () => {
      const result = KeymapGenerator.generateFooter();

      expect(result).toContain('/*');
      expect(result).toContain('*/');
      expect(result).toContain('This export does not include:');
      expect(result).toContain('Combos');
      expect(result).toContain('Macros');
      expect(result).toContain('Custom behaviors');
      expect(result).toContain('To use this file:');
    });
  });

  describe('layer name formatting', () => {
    it('should convert labels to proper constant names', () => {
      // Test via generateLayerConstants
      const layers: Layer[] = [
        { id: 0, label: 'lower', bindings: [] },
        { id: 1, label: 'UPPER', bindings: [] },
        { id: 2, label: 'MixedCase', bindings: [] },
      ];

      const result = KeymapGenerator.generateLayerConstants(layers);

      expect(result).toContain('#define LOWER 0');
      expect(result).toContain('#define UPPER 1');
      expect(result).toContain('#define MIXEDCASE 2');
    });

    it('should convert labels to proper layer node names', () => {
      // Test via generateLayer
      const layer: Layer = {
        id: 0,
        label: 'UPPER Case',
        bindings: [{ behaviorId: 0, param1: 0, param2: null, position: 0 }],
      };

      const result = KeymapGenerator.generateLayer(layer);

      expect(result).toContain('upper_case_layer {');
    });
  });

  // ============================================================================
  // Dynamic Behavior Registry Tests
  // ============================================================================
  describe('generateWithRegistry', () => {
    // Simulates a real keyboard's behavior registry with non-standard IDs
    const mockBehaviorRegistry = new Map([
      [8, { id: 8, displayName: 'Key Press', metadata: [] }],
      [13, { id: 13, displayName: 'Layer-Tap', metadata: [] }],
      [22, { id: 22, displayName: 'Momentary Layer', metadata: [] }],
      [99, { id: 99, displayName: 'Transparent', metadata: [] }],
    ]);

    const keymapWithNonStandardIds: Keymap = {
      layers: [
        {
          id: 0,
          label: 'BASE',
          bindings: [
            { behaviorId: 8, param1: (0x07 << 16) + 0x04, param2: null, position: 0 }, // Key Press (Q)
            { behaviorId: 8, param1: (0x07 << 16) + 0x1A, param2: null, position: 1 }, // Key Press (W)
            { behaviorId: 22, param1: 1, param2: null, position: 2 }, // Momentary Layer 1
          ],
        },
        {
          id: 1,
          label: 'NAV',
          bindings: [
            { behaviorId: 99, param1: 0, param2: null, position: 0 }, // Transparent
            { behaviorId: 13, param1: 2, param2: (0x07 << 16) + 0x2B, position: 1 }, // Layer-Tap
            { behaviorId: 8, param1: (0x07 << 16) + 0x50, param2: null, position: 2 }, // Key Press (Left)
          ],
        },
      ],
      deviceName: 'Toucan',
      layoutName: 'default',
      timestamp: new Date('2026-02-01T10:00:00Z'),
      version: '1.0.0',
      totalBindings: 6,
    };

    it('should generate keymap using behavior registry instead of hardcoded IDs', () => {
      const result = KeymapGenerator.generateWithRegistry(keymapWithNonStandardIds, mockBehaviorRegistry);

      // Should contain proper key bindings, not "Unknown behavior 8"
      expect(result).toContain('&kp');
      expect(result).not.toContain('Unknown behavior 8');
      expect(result).not.toContain('Unknown behavior 22');
      expect(result).not.toContain('Unknown behavior 99');
    });

    it('should format key press with non-standard behavior ID', () => {
      const result = KeymapGenerator.generateWithRegistry(keymapWithNonStandardIds, mockBehaviorRegistry);

      // behaviorId 8 = "Key Press" should produce &kp
      // HID 0x04 = A, HID 0x1A = W
      expect(result).toContain('&kp A');
      expect(result).toContain('&kp W');
    });

    it('should format momentary layer with non-standard behavior ID', () => {
      const result = KeymapGenerator.generateWithRegistry(keymapWithNonStandardIds, mockBehaviorRegistry);

      // behaviorId 22 = "Momentary Layer" should produce &mo
      expect(result).toContain('&mo 1');
    });

    it('should format transparent with non-standard behavior ID', () => {
      const result = KeymapGenerator.generateWithRegistry(keymapWithNonStandardIds, mockBehaviorRegistry);

      // behaviorId 99 = "Transparent" should produce &trans
      expect(result).toContain('&trans');
    });

    it('should format layer-tap with non-standard behavior ID', () => {
      const result = KeymapGenerator.generateWithRegistry(keymapWithNonStandardIds, mockBehaviorRegistry);

      // behaviorId 13 = "Layer-Tap" should produce &lt
      expect(result).toContain('&lt 2 TAB');
    });

    it('should still generate proper metadata and structure', () => {
      const result = KeymapGenerator.generateWithRegistry(keymapWithNonStandardIds, mockBehaviorRegistry);

      // Should still have all the standard structure
      expect(result).toContain('Exported from ZMK Studio');
      expect(result).toContain('Device: Toucan');
      expect(result).toContain('#include <behaviors.dtsi>');
      expect(result).toContain('#define BASE 0');
      expect(result).toContain('#define NAV 1');
      expect(result).toContain('base_layer {');
      expect(result).toContain('nav_layer {');
    });

    it('should fall back to hardcoded behaviors when registry is empty', () => {
      const keymapWithStandardIds: Keymap = {
        layers: [
          {
            id: 0,
            label: 'Test',
            bindings: [
              { behaviorId: 1, param1: (0x07 << 16) + 0x04, param2: null, position: 0 }, // Standard kp ID
              { behaviorId: 0, param1: 0, param2: null, position: 1 }, // Standard trans ID
            ],
          },
        ],
        deviceName: 'Test',
        layoutName: 'default',
        timestamp: new Date('2026-02-01T10:00:00Z'),
        version: '1.0.0',
        totalBindings: 2,
      };

      const emptyRegistry = new Map();
      const result = KeymapGenerator.generateWithRegistry(keymapWithStandardIds, emptyRegistry);

      // Should still work with hardcoded fallback
      // HID 0x04 = A
      expect(result).toContain('&kp A');
      expect(result).toContain('&trans');
    });
  });

  describe('generateLayerWithRegistry', () => {
    const mockRegistry = new Map([
      [8, { id: 8, displayName: 'Key Press', metadata: [] }],
      [22, { id: 22, displayName: 'Momentary Layer', metadata: [] }],
    ]);

    it('should use registry to format bindings in layer', () => {
      const layer: Layer = {
        id: 0,
        label: 'Test',
        bindings: [
          { behaviorId: 8, param1: (0x07 << 16) + 0x04, param2: null, position: 0 }, // HID 0x04 = A
          { behaviorId: 22, param1: 1, param2: null, position: 1 },
        ],
      };

      const result = KeymapGenerator.generateLayerWithRegistry(layer, mockRegistry);

      expect(result).toContain('&kp A');
      expect(result).toContain('&mo 1');
      expect(result).not.toContain('Unknown behavior');
    });
  });
});
