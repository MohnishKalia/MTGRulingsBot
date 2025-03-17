import { motion } from 'framer-motion';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { BotIcon, Layers3Icon, ScrollIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const Overview = () => {
  const { data, error, isLoading } = useSWR('/api/dbStats', fetcher);

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <BotIcon size={32} />
          <span>+</span>
          <ScrollIcon size={32} />
          <span>+</span>
          <Layers3Icon size={32} />
        </p>
        <p className="text-lg font-medium text-center">
          <span className="font-bold text-xl">rules.fyi</span> is the chatbot for{' '}
          <Link href="https://magic.wizards.com" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">
            Magic: The Gathering
          </Link>{' '}
          rulings, designed to elevate your gameplay experience.
        </p>
        {/* 670px is right after iPhone SE */}
        <p className="[@media(max-height:670px)]:hidden font-light">
          Powered by up-to-date <span className="font-semibold">card rulings</span>, comprehensive <span className="font-semibold">game knowledge</span>, and enhanced <span className="font-semibold">reasoning models</span>.
        </p>
        {error ? (
          <p className="text-xs text-muted-foreground">...error loading stats...</p>
        ) : (
          <div className="flex flex-col gap-4 leading-relaxed text-center items-center">
              {isLoading 
                ? <Skeleton className="h-4 w-32"/>
                : <p className="text-xs">
                    {data.dbStats.oracleCardCount} cards, {data.dbStats.rulingCount} rulings since {data.dbStats.recentOracleCardDate}
                  </p>
              }
              {isLoading
                ? <Skeleton className="h-4 w-40"/>
                : <p className="text-xs">
                    {data.vectorStats["mtr"].vectorCount}{' '}
                    <Link href="https://blogs.magicjudges.org/rules/mtr/" target="_blank" rel="noopener noreferrer" className="font-medium">
                      MTR
                    </Link>, 
                    {' '}{data.vectorStats["cr"].vectorCount}{' '}
                    <Link href="https://magic.wizards.com/en/rules" target="_blank" rel="noopener noreferrer" className="font-medium">
                      Comp. Rules
                    </Link>, 
                    {' '}{data.vectorStats["gls"].vectorCount}{' '}
                    <Link href="https://magic.wizards.com/en/rules" target="_blank" rel="noopener noreferrer" className="font-medium">
                      Glossary
                    </Link> docs
                  </p>
              }
          </div>
        )}
      </div>
    </motion.div>
  );
};
