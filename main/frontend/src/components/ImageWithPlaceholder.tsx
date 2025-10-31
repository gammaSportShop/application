import { useState, useCallback } from 'react'
import DotField from './DotField'

type Props = {
    src?: string
    alt?: string
    className?: string
}

export default function ImageWithPlaceholder({ src, alt = '', className = '' }: Props) {
    const [failed, setFailed] = useState(false)
    const [loaded, setLoaded] = useState(false)
    
    const handleError = useCallback(() => {
        setFailed(true)
    }, [])
    
    const handleLoad = useCallback(() => {
        setLoaded(true)
    }, [])
    
    return (
        <div className={["relative overflow-hidden w-full h-full", className].join(" ")}> 
            <DotField className="absolute inset-0" />
            {src && !failed && (
                <img
                    src={src}
                    alt={alt}
                    className={`object-cover w-full h-full transition-opacity duration-300 ${
                        loaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onError={handleError}
                    onLoad={handleLoad}
                />
            )}
        </div>
    )
}


