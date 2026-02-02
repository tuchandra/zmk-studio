/**
 * CopyButton: UI component for copying keymap to clipboard
 *
 * Displays a button with Clipboard icon that copies keymap content
 */

import { Button, Tooltip, TooltipTrigger } from 'react-aria-components';
import { ClipboardCopy } from 'lucide-react';

export interface CopyButtonProps {
  onCopy: () => void | Promise<void>;
  isCopying?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

export function CopyButton({
  onCopy,
  isCopying = false,
  disabled,
  tooltip = 'Copy keymap to clipboard (⌘⇧C)',
}: CopyButtonProps) {
  return (
    <TooltipTrigger>
      <Button
        className="flex items-center justify-center p-1.5 rounded
          enabled:hover:bg-base-300 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150"
        onPress={onCopy}
        isDisabled={disabled || isCopying}
        aria-label="Copy keymap to clipboard"
      >
        <ClipboardCopy
          className={`inline-block w-4 mx-1 ${isCopying ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
      </Button>
      <Tooltip className="bg-gray-800 text-white px-2 py-1 rounded text-sm max-w-xs">
        {tooltip}
      </Tooltip>
    </TooltipTrigger>
  );
}
