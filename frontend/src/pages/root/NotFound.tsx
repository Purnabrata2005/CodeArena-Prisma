
import { Link } from 'react-router-dom'
import { DotLottiePlayer } from '@dotlottie/react-player'
import { Button } from '@heroui/react'

const NotFound = () => {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center text-foreground">
      <div className="w-full max-w-lg">
        <DotLottiePlayer
          src="/Error 404.lottie"
          autoplay
          loop
        />
      </div>
      
      <h1 className="mt-6 text-3xl font-bold">Page Not Found</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link to="/">
        <Button >Go Home</Button>
      </Link>
    </div>
  )
}

export default NotFound
