import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import {
    CircleCheckIcon,
    InfoIcon,
    TriangleAlertIcon,
    OctagonXIcon,
    Loader2Icon,
} from 'lucide-react';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner

      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
            <div className="relative w-6 h-6 flex items-center justify-center">
                <span className='w-5.5 h-5.5 border-[1px] border-primary/20 flex justify-center items-center rounded-full mt-1'>
                      <span className={'w-4 h-4 border-[1px] border-primary/40 flex items-center justify-center rounded-full'}>
                      <CircleCheckIcon className="w-3 h-3 text-primary z-10 relative -right-[0.5px]" />
                </span>
                </span>
            </div>
        ),
        info: (
            <span className='w-5.5 h-5.5 border-[1px] border-yellow-100 flex justify-center items-center rounded-full mt-1'>
                      <span className={'w-4 h-4 border-[1px] border-yellow-200 flex items-center justify-center rounded-full'}>
                           <InfoIcon className="w-3 h-3 z-10 relative -right-[0.75px] text-yellow-300" />
                </span>
                </span>
        ),
        warning: (
            <span className='relative'>
                <span className='w-[1.5px] h-3 bg-orange-400 absolute rotate-30 top-[6px] left-[0.5px] rounded-4xl'></span>
                <TriangleAlertIcon className="size-5 text-orange-400 mt-1" />
                <span className='w-[1.5px] h-3 bg-orange-400 absolute -rotate-30 top-[6px] right-[1px] rounded-4xl'></span>
                <span className='w-[14px] h-[1.5px] bg-orange-400 absolute -bottom-[0.75px] rounded-4xl left-[2px]'></span>
            </span>
        ),
        error: (
          <OctagonXIcon className="size-5 text-red-400 mt-1" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin mt-1 text-primary" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--primary)",
          // "--normal-border": "var(--primary)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast !flex !items-start",
            success: "!border !border-primary !bg-gray-50",
            error: "!border !border-red-400 !bg-red-100",
            warning: "!border !border-orange-400 !bg-orange-50",
            info: "!border !border-yellow-300 !bg-amber-50",

        },
      }}
      {...props}
    />
  )
}

export { Toaster }
