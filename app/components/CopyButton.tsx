import { Tooltip } from "@/components/ui/tooltip";
import { IconButton } from "@chakra-ui/react";
import { Check, Copy } from "@phosphor-icons/react";
import { useState } from "react";

const CopyButton = ({
  content,
  label,
  onClick,
}: {
  content: string;
  label?: string;
  onClick?: (e: any) => void;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
    onClick?.(e);
  };

  return (
    <Tooltip content={label || "Copy"}>
      <IconButton
        size="xs"
        border="none"
        _focus={{ border: "none" }}
        _active={{ border: "none" }}
        onClick={copy}
        aria-label="copy to clipboard"
      >
        {isCopied ? <Check size="16px" /> : <Copy size="16px" />}
      </IconButton>
    </Tooltip>
  );
};

export default CopyButton;
