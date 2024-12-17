import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  EVMConfigMessage,
  WASMConfigMessage,
  HCS1RegistrationMessage,
} from "@/utils/messages";
import {
  filterEVMMessages,
  filterHCS1Messages,
  filterWASMMessages,
  getMessagePreview,
} from "@/utils/messageFilters";

interface MessageAccordionProps {
  messages: any[];
  type: "evm" | "wasm" | "hcs1";
  title: string;
}

export function MessageAccordion({
  messages,
  type,
  title,
}: MessageAccordionProps) {
  const filteredMessages = (() => {
    switch (type) {
      case "evm":
        return filterEVMMessages(messages);
      case "wasm":
        return filterWASMMessages(messages);
      case "hcs1":
        return filterHCS1Messages(messages);
    }
  })();

  if (!Boolean(filteredMessages?.length)) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">{title}</h3>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {filteredMessages.map((msg, index) => {
          const preview = getMessagePreview(msg);
          return (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex flex-col items-start text-left">
                  <div className="font-medium text-sm">{preview.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {preview.subtitle}
                  </div>
                  {preview.tags && preview.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {preview.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4 mt-2 bg-slate-50">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(msg, null, 2)}
                  </pre>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
