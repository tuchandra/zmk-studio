/**
 * HidMapper: Converts HID usage codes to ZMK key names
 *
 * Maps USB HID keyboard page usage IDs to ZMK key name constants
 * (e.g., HID 0x04 → "A", HID 0x2C → "SPACE", HID 0x1E → "N1")
 */

import {
  hid_usage_get_label,
  hid_usage_page_and_id_from_usage,
} from '../hid-usages';
import { KeyCode } from './types';

// USB HID Keyboard/Keypad Page (0x07)
const HID_PAGE_KEYBOARD = 0x07;

// USB HID Consumer Page (0x0C)
const HID_PAGE_CONSUMER = 0x0C;

/**
 * Consumer page key mappings (HID 0x0C) to ZMK C_ prefixed names
 *
 * These map consumer page usage IDs to ZMK key names.
 * ZMK uses C_ prefix for all consumer page keys.
 */
const CONSUMER_KEY_MAP: Record<number, string> = {
  // Media playback controls
  179: 'C_FF',           // Fast Forward
  180: 'C_RW',           // Rewind
  181: 'C_NEXT',         // Scan Next Track
  182: 'C_PREV',         // Scan Previous Track
  183: 'C_STOP',         // Stop
  184: 'C_EJECT',        // Eject
  205: 'C_PP',           // Play/Pause

  // Volume controls
  226: 'C_MUTE',         // Mute
  233: 'C_VOL_UP',       // Volume Increment
  234: 'C_VOL_DN',       // Volume Decrement

  // Brightness controls
  111: 'C_BRI_UP',       // Display Brightness Increment
  112: 'C_BRI_DN',       // Display Brightness Decrement
};

/**
 * Common key name transformations for ZMK compatibility
 *
 * ZMK uses specific naming conventions that differ from HID usage names.
 * This map handles the most common transformations.
 *
 * NOTE: Keys are the ACTUAL labels returned by hid_usage_get_label() from
 * hid-usage-name-overrides.json and keyboard-and-consumer-usage-tables.json
 */
const KEY_NAME_OVERRIDES: Record<string, string> = {
  // Numbers (from hid-usage-name-overrides.json)
  '1': 'N1',
  '2': 'N2',
  '3': 'N3',
  '4': 'N4',
  '5': 'N5',
  '6': 'N6',
  '7': 'N7',
  '8': 'N8',
  '9': 'N9',
  '0': 'N0',

  // Special characters (using actual override labels from JSON)
  '␣': 'SPACE',  // U+2423 Open Box (spacebar)
  'Ret': 'ENTER',  // Return
  'ESC': 'ESC',  // Escape
  'BkSp': 'BSPC',  // Backspace
  'TAB': 'TAB',  // Tab
  'CAPS': 'CAPS',  // Caps Lock

  // Modifiers (using actual override labels from JSON)
  'Ctrl': 'LCTRL',  // Left Control (and Right Control - same label!)
  'Shft': 'LSHFT',  // Left Shift (and Right Shift - same label!)
  'Alt': 'LALT',  // Left Alt
  'GUI': 'LGUI',  // Left GUI (and Right GUI - same label!)
  'AltG': 'RALT',  // Right Alt (AltGr)

  // Arrow keys (using actual override labels from JSON)
  '→': 'RIGHT',  // U+2192 Rightwards Arrow
  '←': 'LEFT',   // U+2190 Leftwards Arrow
  '↓': 'DOWN',   // U+2193 Downwards Arrow
  '↑': 'UP',     // U+2191 Upwards Arrow

  // Function keys (already correct in overrides)
  'F1': 'F1',
  'F2': 'F2',
  'F3': 'F3',
  'F4': 'F4',
  'F5': 'F5',
  'F6': 'F6',
  'F7': 'F7',
  'F8': 'F8',
  'F9': 'F9',
  'F10': 'F10',
  'F11': 'F11',
  'F12': 'F12',

  // Special keys
  'HOME': 'HOME',
  'END': 'END',
  'PGUP': 'PG_UP',
  'PGDN': 'PG_DN',
  'INS': 'INS',
  'DEL': 'DEL',

  // Punctuation (using actual override labels from JSON)
  '-': 'MINUS',
  '=': 'EQUAL',
  '{': 'LBKT',  // Left bracket override is '{'
  '}': 'RBKT',  // Right bracket override is '}'
  '\\': 'BSLH',
  ';': 'SEMI',
  '\'': 'SQT',
  '`': 'GRAVE',
  ',': 'COMMA',
  '.': 'DOT',
  '/': 'FSLH',
};

export class HidMapper {
  /**
   * Get ZMK key name from HID usage code
   *
   * @param hidUsage - HID usage code (16-bit page + 16-bit ID)
   * @returns ZMK key name or null if unknown
   */
  static getZmkKeyName(hidUsage: number): string | null {
    const [page, id] = hid_usage_page_and_id_from_usage(hidUsage);

    // Only handle keyboard and consumer pages
    if (page !== HID_PAGE_KEYBOARD && page !== HID_PAGE_CONSUMER) {
      return null;
    }

    // Consumer page keys - use explicit mapping
    if (page === HID_PAGE_CONSUMER) {
      return CONSUMER_KEY_MAP[id] || null;
    }

    // Special handling for modifiers (0xE0-0xE7) since left and right have same labels
    if (page === HID_PAGE_KEYBOARD && id >= 0xE0 && id <= 0xE7) {
      const modifierMap: Record<number, string> = {
        0xE0: 'LCTRL',
        0xE1: 'LSHFT',
        0xE2: 'LALT',
        0xE3: 'LGUI',
        0xE4: 'RCTRL',
        0xE5: 'RSHFT',
        0xE6: 'RALT',
        0xE7: 'RGUI',
      };
      return modifierMap[id] || null;
    }

    // Get the HID usage label
    const label = hid_usage_get_label(page, id);
    if (!label) {
      return null;
    }

    // Check for overrides first
    if (KEY_NAME_OVERRIDES[label]) {
      return KEY_NAME_OVERRIDES[label];
    }

    // For simple letter keys (A-Z), return as-is
    if (/^[A-Z]$/.test(label)) {
      return label;
    }

    // Remove "Keyboard " prefix if present
    const cleanLabel = label.replace(/^Keyboard /, '');

    // Convert spaces and special chars to underscores, uppercase
    return cleanLabel
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toUpperCase();
  }

  /**
   * Get full KeyCode information
   *
   * @param hidUsage - HID usage code
   * @returns KeyCode object with metadata or null if unknown
   */
  static getKeyCode(hidUsage: number): KeyCode | null {
    const zmkName = this.getZmkKeyName(hidUsage);
    if (!zmkName) {
      return null;
    }

    const [page, id] = hid_usage_page_and_id_from_usage(hidUsage);
    const label = hid_usage_get_label(page, id) || '';

    return {
      hidUsage,
      zmkName,
      label,
      category: this.categorizeKey(zmkName),
    };
  }

  /**
   * Check if a HID usage code is a modifier key
   *
   * @param hidUsage - HID usage code
   * @returns True if the key is a modifier (Ctrl, Shift, Alt, GUI)
   */
  static isModifier(hidUsage: number): boolean {
    const keyName = this.getZmkKeyName(hidUsage);
    if (!keyName) {
      return false;
    }

    const modifiers = ['LCTRL', 'LSHFT', 'LALT', 'LGUI', 'RCTRL', 'RSHFT', 'RALT', 'RGUI'];
    return modifiers.includes(keyName);
  }

  /**
   * Categorize a key by its ZMK name
   *
   * @param zmkName - ZMK key name
   * @returns Key category
   */
  private static categorizeKey(zmkName: string): 'letter' | 'number' | 'modifier' | 'function' | 'special' | 'media' {
    if (/^[A-Z]$/.test(zmkName)) {
      return 'letter';
    }
    if (/^N[0-9]$/.test(zmkName) || /^F[0-9]+$/.test(zmkName)) {
      return zmkName.startsWith('F') ? 'function' : 'number';
    }
    if (['LCTRL', 'LSHFT', 'LALT', 'LGUI', 'RCTRL', 'RSHFT', 'RALT', 'RGUI'].includes(zmkName)) {
      return 'modifier';
    }
    if (zmkName.startsWith('C_')) {
      return 'media';
    }
    return 'special';
  }

  // ============================================================================
  // Modifier Extraction and Formatting
  // ============================================================================
  // Extended HID format: (modifiers << 24) | (page << 16) | id
  // Standard HID format: (page << 16) | id (modifiers byte is 0)
  //
  // USB HID modifier byte bits:
  //   bit 0 (0x01): Left Control
  //   bit 1 (0x02): Left Shift
  //   bit 2 (0x04): Left Alt
  //   bit 3 (0x08): Left GUI
  //   bit 4 (0x10): Right Control
  //   bit 5 (0x20): Right Shift
  //   bit 6 (0x40): Right Alt
  //   bit 7 (0x80): Right GUI

  /**
   * Extract modifier flags from extended HID usage
   *
   * @param hidUsage - HID usage code (possibly with modifier byte in bits 24-31)
   * @returns Modifier byte (0x00-0xFF)
   */
  static extractModifierFlags(hidUsage: number): number {
    return (hidUsage >>> 24) & 0xFF;
  }

  /**
   * Extract the base HID usage (page + id) without modifiers
   *
   * Converts extended format back to standard format by stripping
   * the modifier byte and ensuring page is only 8 bits.
   *
   * @param hidUsage - Extended HID usage code
   * @returns Standard HID usage (page << 16 | id)
   */
  static extractBaseUsage(hidUsage: number): number {
    const page = (hidUsage >>> 16) & 0xFF;  // Only lower 8 bits of page
    const id = hidUsage & 0xFFFF;
    return (page << 16) | id;
  }

  /**
   * Check if the HID usage has modifiers
   *
   * @param hidUsage - HID usage code
   * @returns True if modifier byte is non-zero
   */
  static hasModifiers(hidUsage: number): boolean {
    return this.extractModifierFlags(hidUsage) !== 0;
  }

  /**
   * Format modifier flags as ZMK modifier wrapper prefix
   *
   * @param modifiers - USB HID modifier byte
   * @returns ZMK modifier prefix (e.g., "LC(LA(" for Ctrl+Alt)
   */
  static formatModifierPrefix(modifiers: number): string {
    if (modifiers === 0) return '';

    const parts: string[] = [];

    // Order: Left modifiers first (Ctrl, Shift, Alt, GUI), then right
    // Inner modifiers are applied first in ZMK, so we build outside-in
    if (modifiers & 0x01) parts.push('LC(');  // Left Control
    if (modifiers & 0x02) parts.push('LS(');  // Left Shift
    if (modifiers & 0x04) parts.push('LA(');  // Left Alt
    if (modifiers & 0x08) parts.push('LG(');  // Left GUI
    if (modifiers & 0x10) parts.push('RC(');  // Right Control
    if (modifiers & 0x20) parts.push('RS(');  // Right Shift
    if (modifiers & 0x40) parts.push('RA(');  // Right Alt
    if (modifiers & 0x80) parts.push('RG(');  // Right GUI

    return parts.join('');
  }

  /**
   * Format modifier flags as ZMK modifier wrapper suffix (closing parens)
   *
   * @param modifiers - USB HID modifier byte
   * @returns Closing parentheses for each modifier
   */
  static formatModifierSuffix(modifiers: number): string {
    if (modifiers === 0) return '';

    // Count number of set bits
    let count = 0;
    let m = modifiers;
    while (m) {
      count += m & 1;
      m >>>= 1;
    }

    return ')'.repeat(count);
  }

  /**
   * Get ZMK key name with modifier wrappers
   *
   * Handles extended HID format that includes modifier flags.
   * For standard HID format (no modifiers), returns plain key name.
   *
   * Examples:
   * - 0x00070004 (A) → "A"
   * - 0x04070068 (LA + F13) → "LA(F13)"
   * - 0x0807001D (LG + Z) → "LG(Z)"
   * - 0x0F070009 (LC+LS+LA+LG + F) → "LC(LS(LA(LG(F))))"
   *
   * @param hidUsage - HID usage code (standard or extended format)
   * @returns ZMK key expression or null if base key unknown
   */
  static getZmkKeyNameWithModifiers(hidUsage: number): string | null {
    const modifiers = this.extractModifierFlags(hidUsage);
    const baseUsage = this.extractBaseUsage(hidUsage);

    // Get the base key name
    const keyName = this.getZmkKeyName(baseUsage);
    if (!keyName) {
      return null;
    }

    // If no modifiers, return plain key name
    if (modifiers === 0) {
      return keyName;
    }

    // Wrap with modifier functions
    const prefix = this.formatModifierPrefix(modifiers);
    const suffix = this.formatModifierSuffix(modifiers);

    return `${prefix}${keyName}${suffix}`;
  }
}
