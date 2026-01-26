import Footer from "@/components/Footer"
import Header from "@/components/Header"
import PolicyContent from "@/components/PolicyContent"
import type { Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/get-dictionary"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: Locale }>
}): Promise<Metadata> {
    const { lang } = await params
    const dict = await getDictionary(lang)

    return {
        title: `${dict.footer.legal.terms}`,
        robots: {
            index: true,
            follow: true,
        },
    }
}

export default async function TermsPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dict = await getDictionary(lang)

    const termsPath = join(
        process.cwd(),
        "policies_terms",
        "terms_and_conditions.txt"
    )

    if (!existsSync(termsPath)) {
        notFound()
    }

    const termsContent = readFileSync(termsPath, "utf-8")

    return (
        <div className="flex min-h-screen flex-col">
            <Header lang={lang} dict={dict} />
            <main className="flex-1">
                <PolicyContent content={termsContent} />
            </main>
            <Footer lang={lang} dict={dict} />
        </div>
    )
}
