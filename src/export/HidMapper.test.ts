/**
 * Unit tests for HidMapper
 *
 * Tests HID usage code to ZMK key name conversion
 *
 * HID usage format: (page << 16) + id
 * Keyboard page: 0x07
 */

import { describe, it, expect } from 'vitest';
import { HidMapper } from './HidMapper';

// Helper to create HID usage code from page and ID
const hid = (page: number, id: number) => (page << 16) + id;

// Keyboard page constant
const KB = 0x07;

describe('HidMapper', () => {
  describe('getZmkKeyName', () => {
    it('should convert letter keys', () => {
      // HID 0x04 = A, 0x05 = B, 0x1A = W
      expect(HidMapper.getZmkKeyName(hid(KB, 0x04))).toBe('A');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x05))).toBe('B');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x1A))).toBe('W');
    });

    it('should convert number keys with N prefix', () => {
      // HID 0x1E = 1, 0x1F = 2, 0x27 = 0
      expect(HidMapper.getZmkKeyName(hid(KB, 0x1E))).toBe('N1');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x1F))).toBe('N2');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x27))).toBe('N0');
    });

    it('should convert space to SPACE', () => {
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2C))).toBe('SPACE');
    });

    it('should convert modifiers correctly', () => {
      // HID 0xE0 = LCTRL, 0xE1 = LSHFT, 0xE2 = LALT, 0xE3 = LGUI
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE0))).toBe('LCTRL');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE1))).toBe('LSHFT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE2))).toBe('LALT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE3))).toBe('LGUI');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE4))).toBe('RCTRL');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE5))).toBe('RSHFT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE6))).toBe('RALT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0xE7))).toBe('RGUI');
    });

    it('should convert special keys', () => {
      // Tab, Enter, Escape, Backspace
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2B))).toBe('TAB');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x28))).toBe('ENTER');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x29))).toBe('ESC');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2A))).toBe('BSPC');
    });

    it('should convert arrow keys', () => {
      // Right, Left, Down, Up
      expect(HidMapper.getZmkKeyName(hid(KB, 0x4F))).toBe('RIGHT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x50))).toBe('LEFT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x51))).toBe('DOWN');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x52))).toBe('UP');
    });

    it('should convert function keys', () => {
      // F1, F2, F12
      expect(HidMapper.getZmkKeyName(hid(KB, 0x3A))).toBe('F1');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x3B))).toBe('F2');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x45))).toBe('F12');
    });

    it('should convert punctuation keys', () => {
      // Minus, Equal, Left bracket
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2D))).toBe('MINUS');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2E))).toBe('EQUAL');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x2F))).toBe('LBKT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x30))).toBe('RBKT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x31))).toBe('BSLH');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x33))).toBe('SEMI');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x34))).toBe('SQT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x35))).toBe('GRAVE');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x36))).toBe('COMMA');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x37))).toBe('DOT');
      expect(HidMapper.getZmkKeyName(hid(KB, 0x38))).toBe('FSLH');
    });

    it('should return null for invalid HID codes', () => {
      // Invalid page or unknown code
      expect(HidMapper.getZmkKeyName(0xFFFF)).toBeNull();
    });

    it('should return null for non-keyboard pages', () => {
      // HID page 0x01 (Generic Desktop) instead of 0x07 (Keyboard)
      const genericDesktopUsage = hid(0x01, 0x01);
      expect(HidMapper.getZmkKeyName(genericDesktopUsage)).toBeNull();
    });
  });

  describe('getKeyCode', () => {
    it('should return full KeyCode object for valid keys', () => {
      const usage = hid(KB, 0x04); // A
      const keyCode = HidMapper.getKeyCode(usage);
      expect(keyCode).not.toBeNull();
      expect(keyCode?.hidUsage).toBe(usage);
      expect(keyCode?.zmkName).toBe('A');
      expect(keyCode?.category).toBe('letter');
      expect(keyCode?.label).toBeTruthy();
    });

    it('should categorize number keys correctly', () => {
      const keyCode = HidMapper.getKeyCode(hid(KB, 0x1E)); // 1
      expect(keyCode?.category).toBe('number');
    });

    it('should categorize function keys correctly', () => {
      const keyCode = HidMapper.getKeyCode(hid(KB, 0x3A)); // F1
      expect(keyCode?.category).toBe('function');
    });

    it('should categorize modifiers correctly', () => {
      const keyCode = HidMapper.getKeyCode(hid(KB, 0xE0)); // LCTRL
      expect(keyCode?.category).toBe('modifier');
    });

    it('should categorize special keys correctly', () => {
      const keyCode = HidMapper.getKeyCode(hid(KB, 0x2C)); // SPACE
      expect(keyCode?.category).toBe('special');
    });

    it('should return null for invalid HID codes', () => {
      expect(HidMapper.getKeyCode(0xFFFF)).toBeNull();
    });
  });

  describe('isModifier', () => {
    it('should return true for left modifiers', () => {
      expect(HidMapper.isModifier(hid(KB, 0xE0))).toBe(true); // LCTRL
      expect(HidMapper.isModifier(hid(KB, 0xE1))).toBe(true); // LSHFT
      expect(HidMapper.isModifier(hid(KB, 0xE2))).toBe(true); // LALT
      expect(HidMapper.isModifier(hid(KB, 0xE3))).toBe(true); // LGUI
    });

    it('should return true for right modifiers', () => {
      expect(HidMapper.isModifier(hid(KB, 0xE4))).toBe(true); // RCTRL
      expect(HidMapper.isModifier(hid(KB, 0xE5))).toBe(true); // RSHFT
      expect(HidMapper.isModifier(hid(KB, 0xE6))).toBe(true); // RALT
      expect(HidMapper.isModifier(hid(KB, 0xE7))).toBe(true); // RGUI
    });

    it('should return false for non-modifier keys', () => {
      expect(HidMapper.isModifier(hid(KB, 0x04))).toBe(false); // A
      expect(HidMapper.isModifier(hid(KB, 0x2C))).toBe(false); // SPACE
      expect(HidMapper.isModifier(hid(KB, 0x3A))).toBe(false); // F1
    });

    it('should return false for invalid HID codes', () => {
      expect(HidMapper.isModifier(0xFFFF)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle keys with no label gracefully', () => {
      // Test with an ID that doesn't have a label
      const result = HidMapper.getZmkKeyName(hid(KB, 0xFF));
      // Should return null or a generated name
      expect(result).toBeDefined();
    });

    it('should handle keys without override labels', () => {
      // Keys that exist in HID tables but not in overrides
      // These should go through the fallback transformation logic
      const result = HidMapper.getZmkKeyName(hid(KB, 0x53)); // Num Lock
      expect(result).toBeTruthy();
    });

    it('should return label as-is for single letter keys', () => {
      // Testing the /^[A-Z]$/ regex path
      const letters = ['A', 'B', 'Z'];
      letters.forEach(letter => {
        const hidCode = hid(KB, 0x04 + (letter.charCodeAt(0) - 'A'.charCodeAt(0)));
        const result = HidMapper.getZmkKeyName(hidCode);
        expect(result).toBe(letter);
      });
    });

    it('should transform keyboard prefix labels', () => {
      // Keys that have "Keyboard " prefix should have it removed
      // This tests the fallback path for keys without overrides
      const result = HidMapper.getZmkKeyName(hid(KB, 0x65)); // Application key
      expect(result).toBeTruthy();
      if (result) {
        expect(result).not.toContain('Keyboard');
      }
    });
  });

  // ============================================================================
  // Modifier Extraction and Formatting Tests
  // ============================================================================
  // Extended HID format: (modifiers << 24) | (page << 16) | id
  // Where modifiers is a USB HID modifier byte:
  //   bit 0 (0x01): Left Control
  //   bit 1 (0x02): Left Shift
  //   bit 2 (0x04): Left Alt
  //   bit 3 (0x08): Left GUI
  //   bit 4 (0x10): Right Control
  //   bit 5 (0x20): Right Shift
  //   bit 6 (0x40): Right Alt
  //   bit 7 (0x80): Right GUI

  // Helper to create extended HID usage with modifiers
  const hidMod = (modifiers: number, page: number, id: number) =>
    ((modifiers & 0xFF) << 24) | ((page & 0xFF) << 16) | (id & 0xFFFF);

  describe('extractModifierFlags', () => {
    it('should return 0 for standard HID usage without modifiers', () => {
      expect(HidMapper.extractModifierFlags(hid(KB, 0x04))).toBe(0); // A
      expect(HidMapper.extractModifierFlags(hid(KB, 0x2C))).toBe(0); // SPACE
    });

    it('should extract Left Control modifier (0x01)', () => {
      const usage = hidMod(0x01, KB, 0x04); // LC + A
      expect(HidMapper.extractModifierFlags(usage)).toBe(0x01);
    });

    it('should extract Left Shift modifier (0x02)', () => {
      const usage = hidMod(0x02, KB, 0x04); // LS + A
      expect(HidMapper.extractModifierFlags(usage)).toBe(0x02);
    });

    it('should extract Left Alt modifier (0x04)', () => {
      const usage = hidMod(0x04, KB, 0x04); // LA + A
      expect(HidMapper.extractModifierFlags(usage)).toBe(0x04);
    });

    it('should extract Left GUI modifier (0x08)', () => {
      const usage = hidMod(0x08, KB, 0x04); // LG + A
      expect(HidMapper.extractModifierFlags(usage)).toBe(0x08);
    });

    it('should extract combined modifiers', () => {
      const usage = hidMod(0x05, KB, 0x04); // LC + LA + A
      expect(HidMapper.extractModifierFlags(usage)).toBe(0x05);
    });

    it('should extract all modifiers (Hyper)', () => {
      const usage = hidMod(0x0F, KB, 0x09); // LC+LS+LA+LG + F
      expect(HidMapper.extractModifierFlags(usage)).toBe(0x0F);
    });
  });

  describe('extractBaseUsage', () => {
    it('should return original usage for standard HID without modifiers', () => {
      const standard = hid(KB, 0x04); // A
      expect(HidMapper.extractBaseUsage(standard)).toBe(standard);
    });

    it('should strip modifier byte and return base usage', () => {
      const withMod = hidMod(0x08, KB, 0x1D); // LG + Z = 0x0807001D
      const expected = hid(KB, 0x1D); // Just keyboard Z = 0x0007001D
      expect(HidMapper.extractBaseUsage(withMod)).toBe(expected);
    });

    it('should handle real-world example: 0x0807001D -> 0x0007001D', () => {
      expect(HidMapper.extractBaseUsage(0x0807001D)).toBe(0x0007001D);
    });

    it('should handle modifier + F13: 0x04070068 -> 0x00070068', () => {
      expect(HidMapper.extractBaseUsage(0x04070068)).toBe(0x00070068);
    });
  });

  describe('hasModifiers', () => {
    it('should return false for standard HID usage', () => {
      expect(HidMapper.hasModifiers(hid(KB, 0x04))).toBe(false);
      expect(HidMapper.hasModifiers(hid(KB, 0x2C))).toBe(false);
    });

    it('should return true when any modifier is present', () => {
      expect(HidMapper.hasModifiers(hidMod(0x01, KB, 0x04))).toBe(true); // LC
      expect(HidMapper.hasModifiers(hidMod(0x02, KB, 0x04))).toBe(true); // LS
      expect(HidMapper.hasModifiers(hidMod(0x04, KB, 0x04))).toBe(true); // LA
      expect(HidMapper.hasModifiers(hidMod(0x08, KB, 0x04))).toBe(true); // LG
    });

    it('should return true for combined modifiers', () => {
      expect(HidMapper.hasModifiers(hidMod(0x0F, KB, 0x04))).toBe(true); // Hyper
    });
  });

  describe('formatModifierPrefix', () => {
    it('should return empty string for no modifiers', () => {
      expect(HidMapper.formatModifierPrefix(0x00)).toBe('');
    });

    it('should format Left Control as LC(', () => {
      expect(HidMapper.formatModifierPrefix(0x01)).toBe('LC(');
    });

    it('should format Left Shift as LS(', () => {
      expect(HidMapper.formatModifierPrefix(0x02)).toBe('LS(');
    });

    it('should format Left Alt as LA(', () => {
      expect(HidMapper.formatModifierPrefix(0x04)).toBe('LA(');
    });

    it('should format Left GUI as LG(', () => {
      expect(HidMapper.formatModifierPrefix(0x08)).toBe('LG(');
    });

    it('should format Right Control as RC(', () => {
      expect(HidMapper.formatModifierPrefix(0x10)).toBe('RC(');
    });

    it('should format Right Shift as RS(', () => {
      expect(HidMapper.formatModifierPrefix(0x20)).toBe('RS(');
    });

    it('should format Right Alt as RA(', () => {
      expect(HidMapper.formatModifierPrefix(0x40)).toBe('RA(');
    });

    it('should format Right GUI as RG(', () => {
      expect(HidMapper.formatModifierPrefix(0x80)).toBe('RG(');
    });

    it('should combine LC + LA as LC(LA(', () => {
      expect(HidMapper.formatModifierPrefix(0x05)).toBe('LC(LA(');
    });

    it('should combine all left modifiers (Hyper) as LC(LS(LA(LG(', () => {
      expect(HidMapper.formatModifierPrefix(0x0F)).toBe('LC(LS(LA(LG(');
    });

    it('should combine mixed left and right modifiers', () => {
      // LC + RA = 0x01 + 0x40 = 0x41
      expect(HidMapper.formatModifierPrefix(0x41)).toBe('LC(RA(');
    });
  });

  describe('formatModifierSuffix', () => {
    it('should return empty string for no modifiers', () => {
      expect(HidMapper.formatModifierSuffix(0x00)).toBe('');
    });

    it('should return single ) for one modifier', () => {
      expect(HidMapper.formatModifierSuffix(0x01)).toBe(')');
      expect(HidMapper.formatModifierSuffix(0x02)).toBe(')');
      expect(HidMapper.formatModifierSuffix(0x04)).toBe(')');
    });

    it('should return )) for two modifiers', () => {
      expect(HidMapper.formatModifierSuffix(0x05)).toBe('))'); // LC + LA
    });

    it('should return )))) for four modifiers (Hyper)', () => {
      // 0x0F = LC+LS+LA+LG = 4 modifiers = 4 closing parens
      expect(HidMapper.formatModifierSuffix(0x0F)).toBe('))))');
    });
  });

  describe('getZmkKeyNameWithModifiers', () => {
    it('should return plain key name for standard HID usage', () => {
      expect(HidMapper.getZmkKeyNameWithModifiers(hid(KB, 0x04))).toBe('A');
      expect(HidMapper.getZmkKeyNameWithModifiers(hid(KB, 0x2C))).toBe('SPACE');
    });

    it('should wrap key with single modifier', () => {
      // LA + F13 (0x68)
      const usage = hidMod(0x04, KB, 0x68);
      expect(HidMapper.getZmkKeyNameWithModifiers(usage)).toBe('LA(F13)');
    });

    it('should wrap key with Left GUI modifier', () => {
      // LG + Z (0x1D)
      const usage = hidMod(0x08, KB, 0x1D);
      expect(HidMapper.getZmkKeyNameWithModifiers(usage)).toBe('LG(Z)');
    });

    it('should wrap key with multiple modifiers', () => {
      // LC + LA + A
      const usage = hidMod(0x05, KB, 0x04);
      expect(HidMapper.getZmkKeyNameWithModifiers(usage)).toBe('LC(LA(A))');
    });

    it('should handle Hyper + F (all left modifiers)', () => {
      // LC+LS+LA+LG + F (0x09)
      const usage = hidMod(0x0F, KB, 0x09);
      expect(HidMapper.getZmkKeyNameWithModifiers(usage)).toBe('LC(LS(LA(LG(F))))');
    });

    it('should handle real-world example: 0x0807001D -> LG(Z)', () => {
      expect(HidMapper.getZmkKeyNameWithModifiers(0x0807001D)).toBe('LG(Z)');
    });

    it('should handle real-world example: 0x04070068 -> LA(F13)', () => {
      expect(HidMapper.getZmkKeyNameWithModifiers(0x04070068)).toBe('LA(F13)');
    });

    it('should return null for unknown base key', () => {
      const usage = hidMod(0x04, 0x99, 0x01); // Invalid page
      expect(HidMapper.getZmkKeyNameWithModifiers(usage)).toBeNull();
    });
  });

  // ============================================================================
  // Consumer Page Key Support (Media Keys)
  // ============================================================================
  // USB HID Consumer Page (0x0C) contains media keys like volume, playback, etc.
  // ZMK uses C_ prefixed names for consumer keys (e.g., C_VOL_UP, C_MUTE)

  const CONSUMER = 0x0C;

  describe('Consumer Page Keys (Media Keys)', () => {
    describe('getZmkKeyName with consumer keys', () => {
      it('should convert Volume Increment to C_VOL_UP', () => {
        // Consumer page 0x0C, ID 233 (0xE9)
        expect(HidMapper.getZmkKeyName(hid(CONSUMER, 233))).toBe('C_VOL_UP');
      });

      it('should convert Volume Decrement to C_VOL_DN', () => {
        // Consumer page 0x0C, ID 234 (0xEA)
        expect(HidMapper.getZmkKeyName(hid(CONSUMER, 234))).toBe('C_VOL_DN');
      });

      it('should convert Mute to C_MUTE', () => {
        // Consumer page 0x0C, ID 226 (0xE2)
        expect(HidMapper.getZmkKeyName(hid(CONSUMER, 226))).toBe('C_MUTE');
      });

      it('should convert Play/Pause to C_PP', () => {
        // Consumer page 0x0C, ID 205 (0xCD)
        expect(HidMapper.getZmkKeyName(hid(CONSUMER, 205))).toBe('C_PP');
      });

      it('should convert Display Brightness Increment to C_BRI_UP', () => {
        // Consumer page 0x0C, ID 111 (0x6F)
        expect(HidMapper.getZmkKeyName(hid(CONSUMER, 111))).toBe('C_BRI_UP');
      });

      it('should convert Display Brightness Decrement to C_BRI_DN', () => {
        // Consumer page 0x0C, ID 112 (0x70)
        expect(HidMapper.getZmkKeyName(hid(CONSUMER, 112))).toBe('C_BRI_DN');
      });

      it('should convert Next Track to C_NEXT', () => {
        // Consumer page 0x0C, ID 181 (0xB5)
        expect(HidMapper.getZmkKeyName(hid(CONSUMER, 181))).toBe('C_NEXT');
      });

      it('should convert Previous Track to C_PREV', () => {
        // Consumer page 0x0C, ID 182 (0xB6)
        expect(HidMapper.getZmkKeyName(hid(CONSUMER, 182))).toBe('C_PREV');
      });

      it('should convert Stop to C_STOP', () => {
        // Consumer page 0x0C, ID 183 (0xB7)
        expect(HidMapper.getZmkKeyName(hid(CONSUMER, 183))).toBe('C_STOP');
      });

      it('should convert Eject to C_EJECT', () => {
        // Consumer page 0x0C, ID 184 (0xB8)
        expect(HidMapper.getZmkKeyName(hid(CONSUMER, 184))).toBe('C_EJECT');
      });
    });

    describe('getZmkKeyNameWithModifiers with consumer keys', () => {
      it('should format consumer key without modifiers', () => {
        expect(HidMapper.getZmkKeyNameWithModifiers(hid(CONSUMER, 233))).toBe('C_VOL_UP');
      });

      it('should format consumer key with modifier', () => {
        // LS + Volume Up
        const usage = hidMod(0x02, CONSUMER, 233);
        expect(HidMapper.getZmkKeyNameWithModifiers(usage)).toBe('LS(C_VOL_UP)');
      });

      it('should format consumer key with multiple modifiers', () => {
        // LC + LA + Mute
        const usage = hidMod(0x05, CONSUMER, 226);
        expect(HidMapper.getZmkKeyNameWithModifiers(usage)).toBe('LC(LA(C_MUTE))');
      });
    });

    describe('getKeyCode with consumer keys', () => {
      it('should return KeyCode object for volume up', () => {
        const keyCode = HidMapper.getKeyCode(hid(CONSUMER, 233));
        expect(keyCode).not.toBeNull();
        expect(keyCode?.zmkName).toBe('C_VOL_UP');
        expect(keyCode?.category).toBe('media');
      });

      it('should return KeyCode object for play/pause', () => {
        const keyCode = HidMapper.getKeyCode(hid(CONSUMER, 205));
        expect(keyCode).not.toBeNull();
        expect(keyCode?.zmkName).toBe('C_PP');
        expect(keyCode?.category).toBe('media');
      });
    });
  });

  // ============================================================================
  // Real-world Symbol Layer HID Codes (from Toucan keyboard)
  // ============================================================================
  // These are shifted keys that produce symbols like |, :, <, {, etc.
  // Format: 0xMMPPIIII where MM=modifier, PP=page, IIII=id
  describe('Shifted symbol keys (real-world HID codes)', () => {
    it('should convert 0x2070031 to LS(BSLH) for pipe |', () => {
      // 0x02 = Left Shift, 0x07 = keyboard, 0x31 = backslash
      expect(HidMapper.getZmkKeyNameWithModifiers(0x2070031)).toBe('LS(BSLH)');
    });

    it('should convert 0x2070033 to LS(SEMI) for colon :', () => {
      // 0x02 = Left Shift, 0x07 = keyboard, 0x33 = semicolon
      expect(HidMapper.getZmkKeyNameWithModifiers(0x2070033)).toBe('LS(SEMI)');
    });

    it('should convert 0x2070036 to LS(COMMA) for less-than <', () => {
      // 0x02 = Left Shift, 0x07 = keyboard, 0x36 = comma
      expect(HidMapper.getZmkKeyNameWithModifiers(0x2070036)).toBe('LS(COMMA)');
    });

    it('should convert 0x207002f to LS(LBKT) for left brace {', () => {
      // 0x02 = Left Shift, 0x07 = keyboard, 0x2f = left bracket
      expect(HidMapper.getZmkKeyNameWithModifiers(0x207002f)).toBe('LS(LBKT)');
    });

    it('should convert 0x2070026 to LS(N9) for left paren (', () => {
      // 0x02 = Left Shift, 0x07 = keyboard, 0x26 = 9
      expect(HidMapper.getZmkKeyNameWithModifiers(0x2070026)).toBe('LS(N9)');
    });

    it('should convert 0x207002d to LS(MINUS) for underscore _', () => {
      // 0x02 = Left Shift, 0x07 = keyboard, 0x2d = minus
      expect(HidMapper.getZmkKeyNameWithModifiers(0x207002d)).toBe('LS(MINUS)');
    });

    it('should convert 0x2070037 to LS(DOT) for greater-than >', () => {
      // 0x02 = Left Shift, 0x07 = keyboard, 0x37 = period
      expect(HidMapper.getZmkKeyNameWithModifiers(0x2070037)).toBe('LS(DOT)');
    });

    it('should convert 0x2070030 to LS(RBKT) for right brace }', () => {
      // 0x02 = Left Shift, 0x07 = keyboard, 0x30 = right bracket
      expect(HidMapper.getZmkKeyNameWithModifiers(0x2070030)).toBe('LS(RBKT)');
    });

    it('should convert 0x2070027 to LS(N0) for right paren )', () => {
      // 0x02 = Left Shift, 0x07 = keyboard, 0x27 = 0
      expect(HidMapper.getZmkKeyNameWithModifiers(0x2070027)).toBe('LS(N0)');
    });

    it('should convert 0x2070020 to LS(N3) for hash #', () => {
      // 0x02 = Left Shift, 0x07 = keyboard, 0x20 = 3
      expect(HidMapper.getZmkKeyNameWithModifiers(0x2070020)).toBe('LS(N3)');
    });

    // Debug: test the extraction functions directly
    it('should extract modifier 0x02 from 0x2070031', () => {
      expect(HidMapper.extractModifierFlags(0x2070031)).toBe(0x02);
    });

    it('should extract base usage 0x00070031 from 0x2070031', () => {
      expect(HidMapper.extractBaseUsage(0x2070031)).toBe(0x00070031);
    });

    it('should get BSLH for base usage 0x00070031', () => {
      expect(HidMapper.getZmkKeyName(0x00070031)).toBe('BSLH');
    });
  });
});
