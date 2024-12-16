import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';

const formStyles = {
  input: `mt-1 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
          focus:ring-2 focus:ring-[#6100ff]/20 focus:border-[#6100ff] transition-colors duration-200`,
  label: `block text-sm font-medium text-gray-700`,
  formGroup: `mb-4`,
};

interface HCS1RegistrationFormProps {
  onSubmit: (data: any) => void;
  isConnected: boolean;
  isSubmitting: boolean;
  getSubmitButtonText: (type: 'evm' | 'wasm' | 'hcs1') => string;
  defaultValues?: {
    topicId: string;
    memo: string;
    weight: number;
    tags: string;
  };
  registrations?: Array<{
    topicId: string;
    memo: string;
    weight: number;
    tags: string[];
  }>;
}

export function HCS1RegistrationForm({
  onSubmit,
  isConnected,
  isSubmitting,
  getSubmitButtonText,
  defaultValues,
  registrations = [],
}: HCS1RegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });

  return (
    <div className='space-y-6'>
      <div className='bg-purple-50 rounded-lg p-4'>
        <p className='text-sm text-purple-800'>
          HCS-1 registrations link your HCS-7 topic to other topics in the
          network. Each registration includes a weight and tags to help organize
          and prioritize the topics in your network. The weight determines the
          probability of selection when multiple topics match your criteria,
          however keep in mind that WASM modules implement their own selection
          logic.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4'>
          <div className={formStyles.formGroup}>
            <label className={formStyles.label}>Topic ID</label>
            <input
              {...register('topicId', { required: 'Topic ID is required' })}
              className={formStyles.input}
              placeholder='0.0.12345'
            />
            {errors.topicId && (
              <p className='mt-1 text-sm text-red-500'>
                {errors.topicId.message}
              </p>
            )}
            <p className='mt-1 text-xs text-gray-500'>
              The topic ID to register with this HCS-7 topic
            </p>
          </div>

          <div className={formStyles.formGroup}>
            <label className={formStyles.label}>Weight</label>
            <input
              {...register('weight', {
                required: 'Weight is required',
                min: { value: 0, message: 'Weight must be positive' },
                max: { value: 1, message: 'Weight must be between 0 and 1' },
              })}
              type='number'
              step='0.1'
              className={formStyles.input}
              placeholder='1.0'
            />
            {errors.weight && (
              <p className='mt-1 text-sm text-red-500'>
                {errors.weight.message}
              </p>
            )}
            <p className='mt-1 text-xs text-gray-500'>
              A value between 0 and 1 that determines selection probability
            </p>
          </div>

          <div className={formStyles.formGroup}>
            <label className={formStyles.label}>Tags</label>
            <input
              {...register('tags', { required: 'Tags are required' })}
              className={formStyles.input}
              placeholder='tag1, tag2, tag3'
            />
            {errors.tags && (
              <p className='mt-1 text-sm text-red-500'>{errors.tags.message}</p>
            )}
            <p className='mt-1 text-xs text-gray-500'>
              Comma-separated list of tags for this topic
            </p>
          </div>

          <div className={formStyles.formGroup}>
            <label className={formStyles.label}>Memo</label>
            <input
              {...register('memo')}
              className={formStyles.input}
              placeholder='Description of this registration'
            />
            <p className='mt-1 text-xs text-gray-500'>
              Optional description for this registration
            </p>
          </div>
        </div>

        <div className='flex justify-end'>
          <Button
            type='submit'
            disabled={!isConnected || isSubmitting}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isConnected && !isSubmitting
                ? 'bg-[#6100ff] hover:bg-[#5000d9]'
                : 'bg-gray-400 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6100ff]`}
          >
            {isSubmitting ? 'Submitting...' : getSubmitButtonText('hcs1')}
          </Button>
        </div>
      </form>
    </div>
  );
}
