import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ImageSelect } from "../Builder/InscriptionSelect";

interface HCS1RegistrationFormProps {
  onSubmit: (data: any) => void;
  isConnected: boolean;
  isSubmitting: boolean;
  getSubmitButtonText: (type: "evm" | "wasm" | "hcs1") => string;
  defaultValues?: {
    topicId: string;
    memo: string;
    weight: number;
    tags: string;
  };
}

export function HCS1RegistrationForm({
  onSubmit,
  isConnected,
  isSubmitting,
  getSubmitButtonText,
  defaultValues,
}: HCS1RegistrationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });
  const topic = watch("topicId");

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible>
        <AccordionItem value="info">
          <AccordionTrigger className="text-sm">
            What are HCS-1 registrations?
          </AccordionTrigger>
          <AccordionContent>
            <Alert className="bg-purple-50">
              <AlertDescription className="text-purple-800">
                HCS-1 registrations link your HCS-7 topic to other topics in the
                network. Each registration includes a weight and tags to help
                organize and prioritize the topics in your network. The weight
                determines the probability of selection when multiple topics
                match your criteria, however keep in mind that WASM modules
                implement their own selection logic.
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-2 col-span-2">
        <ImageSelect
          onChange={(hcsUrl) => setValue("topicId", hcsUrl)}
          formData={topic}
          introMessage="Topic ID"
          warningMessage="Select a topic to register"
          network="testnet"
          messageEnabled
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
          <div className="space-y-2">
            <input type="hidden" {...register("topicId")} value={topic} />
            <Label>Weight</Label>
            <Input
              {...register("weight", {
                required: "Weight is required",
                min: { value: 0, message: "Weight must be positive" },
                max: { value: 1, message: "Weight must be between 0 and 1" },
              })}
              type="number"
              step="0.1"
              placeholder="1.0"
            />
            {errors.weight && (
              <p className="text-sm text-red-500">{errors.weight.message}</p>
            )}
            <p className="text-xs text-gray-500">
              A value between 0 and 1 that determines selection probability
            </p>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              {...register("tags", { required: "Tags are required" })}
              placeholder="tag1, tag2, tag3"
            />
            {errors.tags && (
              <p className="text-sm text-red-500">{errors.tags.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Comma-separated list of tags for this topic
            </p>
          </div>

          <div className="space-y-2">
            <Label>Memo</Label>
            <Input
              {...register("memo")}
              placeholder="Description of this registration"
            />
            <p className="text-xs text-gray-500">
              Optional description for this registration
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isConnected || isSubmitting}
            variant={isConnected && !isSubmitting ? "default" : "secondary"}
          >
            {isSubmitting ? "Submitting..." : getSubmitButtonText("hcs1")}
          </Button>
        </div>
      </form>
    </div>
  );
}
