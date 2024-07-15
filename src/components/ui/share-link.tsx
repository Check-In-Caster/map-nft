import { Link } from 'lucide-react';
import Image from 'next/image';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { Dialog, DialogContent, DialogTrigger } from './dialog';

const ShareRefLink = ({ wallet_address }: { wallet_address: string }) => {
  const account = useAccount();
  const shareUrl = `https://property.checkin.gg/stats/${wallet_address}?ref=${account?.address}`;
  const portfolioFrameUrl = `https://property.checkin.gg/portfolio?wallet_address=${wallet_address}`;
  const shareText =
    'Check out the onchain properties I own in my portfolio - create yours too!';

  return (
    <Dialog defaultOpen={false}>
      <DialogContent
        className='max-w-[600px] px-0 sm:px-6 z-40 max-h-[800px] bg-[#FFF8F0] overflow-y-scroll no-scrollbar'
        onInteractOutside={(e) => {}}
      >
        <h3 className='mb-0'> Share your onchain property portfolio</h3>
        <p className='mt-0 text-gray-700'>
          Share and show off your onchain property portfolio!
        </p>

        <input type='text' value={shareUrl} className='border py-2 px-2' />

        <div className='flex justify-around items-center w-2/3 mx-auto my-8'>
          <CopyToClipboard
            onCopy={() => {
              toast.success('Copied to clipboard');
            }}
            text={`${shareUrl}`}
          >
            <a className='w-14 cursor-pointer h-14 flex justify-center items-center bg-gray-200 rounded-full'>
              <Link className='h-5 w-5' strokeWidth={3} />
            </a>
          </CopyToClipboard>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURI(
              shareText
            )}&url=${shareUrl}`}
            target='_blank'
            rel='noreferrer'
            className='w-14 cursor-pointer h-14 flex justify-center items-center bg-black rounded-full'
          >
            <Image
              src='/assets/icons/xlogo.svg'
              alt='x_logo'
              width={5}
              height={5}
              className='h-5 w-5'
            />
          </a>
          <a
            href={`https://warpcast.com/~/compose?embeds[]=${shareUrl.replace(
              '?property=',
              'frame?property='
            )}&embeds[]=${portfolioFrameUrl}&text=${encodeURI(shareText)}`}
            target='_blank'
            className='w-14 cursor-pointer h-14 flex justify-center items-center bg-[#855DCD] rounded-full'
          >
            <Image
              src='/assets/icons/flogo.svg'
              alt='x_logo'
              width={5}
              height={5}
              className='h-8 w-8'
            />
          </a>
        </div>
      </DialogContent>
      <DialogTrigger asChild>
        <button
          className={`border border-gray-900 py-2 px-6 disabled:opacity-50 ${'bg-[#EF9854] text-[#000]'}`}
        >
          Share your portfolio
        </button>
      </DialogTrigger>
    </Dialog>
  );
};

export default ShareRefLink;
