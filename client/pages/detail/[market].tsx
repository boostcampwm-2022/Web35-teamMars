import { styled } from '@mui/material/styles'
import { Box, Button, useMediaQuery, useTheme } from '@mui/material'
import MobileInfo from '@/components/Tab'
import Link from 'next/link'
import ChartPeriodSelector from '@/components/ChartPeriodSelector'
import {
  DEFAULT_CANDLE_PERIOD,
  DEFAULT_CANDLER_CHART_RENDER_OPTION
} from '@/constants/ChartConstants'
import { CandleData, ChartPeriod, ChartRenderOption } from '@/types/ChartTypes'
import { getCandleDataArray } from '@/utils/upbitManager'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { CandleChart } from '@/components/CandleChart'
import { useRealTimeUpbitData } from 'hooks/useRealTimeUpbitData'
import { useState } from 'react'

export default function Detail({
  market,
  candleData
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('tablet'))
  const [chartRenderOption, setRenderOption] = useState<ChartRenderOption>({
    ...DEFAULT_CANDLER_CHART_RENDER_OPTION,
    marketType: market
  })
  const [candlePeriod, setCandlePeriod] = useState<ChartPeriod>(
    DEFAULT_CANDLE_PERIOD
  )
  const [realtimeCandleData, setRealtimeCandleData] = useRealTimeUpbitData(
    candlePeriod,
    chartRenderOption.marketType,
    candleData
  )
  return (
    <HomeContainer>
      <ChartContainer>
        <ChartPeriodSelector
          selected={candlePeriod}
          selectedSetter={setCandlePeriod}
        />
        <CandleChart
          candlePeriod={candlePeriod}
          candleData={realtimeCandleData}
          candleDataSetter={setRealtimeCandleData}
          option={chartRenderOption}
          optionSetter={setRenderOption}
        ></CandleChart>
      </ChartContainer>
      <InfoContainer>
        {isMobile ? <MobileInfo /> : renderDesktopInfo()}
      </InfoContainer>
    </HomeContainer>
  )
}

interface CandleChartPageProps {
  market: string
  candleData: CandleData[]
} //페이지 자체의 props interface
export const getServerSideProps: GetServerSideProps<
  CandleChartPageProps
> = async context => {
  if (context.params === undefined) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    }
  }

  const market = Array.isArray(context.params.market)
    ? context.params.market[0]
    : context.params.market

  if (!market) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    }
  }

  const fetchedCandleData: CandleData[] | null = await getCandleDataArray(
    DEFAULT_CANDLE_PERIOD,
    market,
    200
  )
  if (fetchedCandleData === null) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    }
  }
  return {
    props: {
      market: market,
      candleData: fetchedCandleData
    } // will be passed to the page component as props
  }
}

function renderDesktopInfo() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <StyledRTV>실시간 코인시세</StyledRTV>
      <StyledRTV>코인 상세정보</StyledRTV>
      <Link href="/">
        <Button
          style={{ minWidth: '100px', width: '100%' }}
          size="large"
          variant="contained"
        >
          Go To Main
        </Button>
      </Link>
    </div>
  )
}

const HomeContainer = styled(Box)`
  display: flex;
  width: 100%;
  max-width: 1920px;
  height: 100%;
  align-items: center;
  ${props => props.theme.breakpoints.down('tablet')} {
    flex-direction: column;
  }
`
//왼쪽 메인차트
const ChartContainer = styled('div')`
  display: flex;
  box-sizing: content-box;
  min-width: 300px;
  width: 100%;
  height: calc(100% - 48px);
  flex-direction: column;
  border-radius: 32px;
  ${props => props.theme.breakpoints.down('tablet')} {
    height: 50%;
  }
`

//오른쪽 정보 표시 사이드바
const InfoContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid black;
  border-radius: 32px;
  width: 390px;
  height: calc(100% - 48px);
  ${props => props.theme.breakpoints.down('tablet')} {
    margin: 0;
    width: 100%; //매직넘버 제거 및 반응형 관련 작업 필요(모바일에서는 100%)
  }
`

const StyledRTV = styled('div')`
  display: flex;
  width: 100%;
  height: 43%;
  background-color: #ffffff;
  border: 1px solid #cac4d0;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
  padding-bottom: 24px;
`
