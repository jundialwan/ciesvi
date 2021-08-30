import { Box, Button, Code, Divider, FormControl, FormHelperText, FormLabel, Heading, HStack, Input, Radio, RadioGroup, Stack, Stat, StatGroup, StatHelpText, StatLabel, StatNumber, Table, TableCaption, Tbody, Td, Textarea, Th, Thead, Tr } from '@chakra-ui/react'
import React, { FC } from 'react'

type Step2CheckType = {
  parsedData: { [key: string]: any }[] | undefined,
  dataHeader: string[] | undefined
}

const Step2Check: FC<Step2CheckType> = ({ parsedData, dataHeader }) => {
  
  if (parsedData && dataHeader) {
    return (
      <>
        <Box alignSelf="center" p="4" mb="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
          <StatGroup>
            <Stat>
              <StatLabel>Total row(s)</StatLabel>
              <StatNumber>{parsedData.length}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>Header Detected</StatLabel>
              <StatNumber>{dataHeader.length}</StatNumber>
              <StatHelpText>
                {dataHeader.toString().split(',').map(dh => `"${dh}"`).join(', ')}
              </StatHelpText>
            </Stat>
          </StatGroup>
        </Box>

        <Box alignSelf="center" overflowX="auto" p="4" mb="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
          <Table variant="striped" colorScheme="gray">
            <TableCaption>Sample of the first five data.</TableCaption>

            <Thead>
              <Tr>
                {dataHeader.map((dh, idx) => <Th key={`${dh}-${idx}`}>{dh}</Th>)}
              </Tr>
            </Thead>

            <Tbody>
              {parsedData.slice(0, 5).map((d, idx) => (
                <Tr key={idx}>
                  {dataHeader.map(dh => <Td key={`${dh}-${d[dh]}`}>{d[dh]}</Td>)}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </>
    )
  } else {
    return null
  }
}

export default Step2Check