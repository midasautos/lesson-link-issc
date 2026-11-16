import { ShieldCheck } from "lucide-react";
import Image from 'next/image'

export function BrandLogo() {
    return (
        <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center text-primary-foreground">
                <Image 
                    src="/astra.png"
                    width={50}
                    height={50}
                    alt="App Logo"
                    className="bg-transparent"
                />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">
                LessonLink
            </span>
        </div>
    );
}
