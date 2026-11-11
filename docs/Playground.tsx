import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  NumberInput,
  SegmentedControl,
  Slider,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useState } from 'react';

import { Odometer } from '../src';

const DEFAULT_DURATION = 2000;
const DEFAULT_DECIMALS = 2;
const DEFAULT_SEPARATOR = ',';
const DEFAULT_DECIMAL = '.';

const SEPARATORS = {
  comma: ',',
  period: '.',
  space: ' ',
  none: '',
} as const;

const DECIMALS_OPTIONS = Array.from({ length: 4 }, (_, index) => String(index));

function randomValue(decimals: number) {
  const scale = 10 ** decimals;
  return Math.floor(Math.random() * 100_000 * scale) / scale;
}

const INITIAL_VALUE = randomValue(DEFAULT_DECIMALS);

function toSeparatorKey(separator: string) {
  return (
    (Object.keys(SEPARATORS) as Array<keyof typeof SEPARATORS>).find(
      (key) => SEPARATORS[key] === separator,
    ) ?? 'none'
  );
}

export default function Playground() {
  const [value, setValue] = useState(INITIAL_VALUE);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [decimals, setDecimals] = useState(DEFAULT_DECIMALS);
  const [separator, setSeparator] = useState(DEFAULT_SEPARATOR);
  const [decimal, setDecimal] = useState(DEFAULT_DECIMAL);

  const reset = () => {
    setValue(INITIAL_VALUE);
    setDuration(DEFAULT_DURATION);
    setDecimals(DEFAULT_DECIMALS);
    setSeparator(DEFAULT_SEPARATOR);
    setDecimal(DEFAULT_DECIMAL);
  };

  return (
    <Grid gap='lg' my='md' align='stretch'>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card
          withBorder
          radius='lg'
          p={{ base: 'lg', sm: 'xl' }}
          bg='var(--mantine-color-default)'
          h='100%'
        >
          <Stack gap='md' align='center' justify='center' h='100%'>
            <Group gap='xs' justify='center' wrap='wrap'>
              <Badge variant='light'>Live preview</Badge>
              <Badge variant='outline' color='gray'>
                @guoyunhe/react-odometer
              </Badge>
            </Group>

            <Text
              component='div'
              fz={{ base: 40, sm: 56, md: 44, lg: 56 }}
              fw={700}
              lh={1.1}
              ta='center'
            >
              <Odometer
                value={value}
                duration={duration}
                decimals={decimals}
                separator={separator}
                decimal={decimal}
              />
            </Text>

            <Group gap='xs' justify='center' wrap='wrap'>
              <Button variant='default' onClick={() => setValue((current) => current - 100)}>
                − 100
              </Button>
              <Button variant='light' onClick={() => setValue(randomValue(decimals))}>
                Random
              </Button>
              <Button variant='default' onClick={() => setValue((current) => current + 100)}>
                + 100
              </Button>
            </Group>
          </Stack>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card withBorder radius='lg' p={{ base: 'lg', sm: 'xl' }} h='100%'>
          <Group justify='space-between' mb='md'>
            <Title order={3} size='h4'>
              Controls
            </Title>
            <Button variant='subtle' size='compact-sm' onClick={reset}>
              Reset
            </Button>
          </Group>

          <Stack gap='lg'>
            <NumberInput
              label='Value'
              value={value}
              onChange={(next) => setValue(typeof next === 'number' ? next : Number(next) || 0)}
              step={100}
              thousandSeparator={separator && separator !== decimal ? separator : undefined}
              decimalSeparator={decimal}
              decimalScale={decimals}
              fixedDecimalScale
            />

            <Stack gap='xs'>
              <Group justify='space-between'>
                <Text size='sm' fw={500}>
                  Duration
                </Text>
                <Text size='sm' c='dimmed'>
                  {duration} ms
                </Text>
              </Group>
              <Slider
                value={duration}
                onChange={setDuration}
                min={100}
                max={3000}
                step={100}
                label={(current) => `${current} ms`}
                thumbLabel='Duration'
                thumbValueText={(current) => `${current} milliseconds`}
              />
            </Stack>

            <Stack gap={6}>
              <Text size='sm' fw={500}>
                Decimal places
              </Text>
              <SegmentedControl
                fullWidth
                data={DECIMALS_OPTIONS}
                value={String(decimals)}
                onChange={(next) => setDecimals(Number(next))}
              />
            </Stack>

            <Stack gap={6}>
              <Text size='sm' fw={500}>
                Thousands separator
              </Text>
              <SegmentedControl
                fullWidth
                data={[
                  { value: 'comma', label: 'Comma' },
                  { value: 'period', label: 'Period' },
                  { value: 'space', label: 'Space' },
                  { value: 'none', label: 'None' },
                ]}
                value={toSeparatorKey(separator)}
                onChange={(key) => setSeparator(SEPARATORS[key as keyof typeof SEPARATORS])}
              />
            </Stack>

            <Stack gap={6}>
              <Text size='sm' fw={500}>
                Decimal separator
              </Text>
              <SegmentedControl
                fullWidth
                data={[
                  { value: '.', label: 'Period (.)' },
                  { value: ',', label: 'Comma (,)' },
                ]}
                value={decimal}
                onChange={setDecimal}
              />
            </Stack>
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
