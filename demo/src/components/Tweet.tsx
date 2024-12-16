import { Tweet as ReactTweet } from 'react-tweet'

interface TweetProps {
  id: string;
}

export default function Tweet({ id }: TweetProps) {
  return (
    <div className="flex justify-center">
      <ReactTweet id={id} />
    </div>
  );
}
