import { NextPage } from 'next'
import React, { useState } from 'react'
import { WarningIcon, CheckCircleIcon } from '@chakra-ui/icons'
import debounce from 'lodash.debounce'

import {
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionButton,
  AccordionPanel,
  Box,
  Text,
  Container,
} from "@chakra-ui/react"
import Step1Upload from '../src/components/step1upload'
import Step2Check from '../src/components/step2check'
import Step3ForEach from '../src/components/step3foreach'
import Step4Execute from '../src/components/step4execute'

const Upload: NextPage = () => {
  
  const [parsedData, setParsedData] = useState<{ [key: string]: any }[]>()
  const [dataHeader, setdataHeader] = useState<string[]>()
  const requestMethod: any = (document.querySelector('input[name="requestMethod"]:checked')  as HTMLInputElement)?.value
  const url = (document.getElementById('url') as HTMLInputElement)?.value

  return (
    <Container maxW="container.lg" centerContent>
      {/* <Box alignSelf="center" w="5xl" p="4" m="4" borderRadius="md" borderColor="gray.300" borderWidth="1px"> */}
        <Accordion defaultIndex={[0]} allowMultiple>
          <Box alignSelf="center" w="5xl" p="0" m="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
            <AccordionItem borderWidth="0px !important">
              <AccordionButton>
                <Box flex="1" display="flex" flexDirection="row" alignItems="center" textAlign="left">
                  {dataHeader && parsedData ? 
                    <CheckCircleIcon mr="4px" w={6} h={6} color="green.400"/> :
                    <WarningIcon mr="4px" w={6} h={6} color="yellow.400"/>
                  }
                  <Text color="gray.700" fontSize="xl">
                    Step 1️⃣ Upload your CSV
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              

              <AccordionPanel p="2">
                <Step1Upload setDataHeader={setdataHeader} setParsedData={setParsedData} />
              </AccordionPanel>
            </AccordionItem>
          </Box>

          <Box alignSelf="center" w="5xl" p="0" m="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
            <AccordionItem isDisabled={!dataHeader || !parsedData} borderWidth="0px !important">
              
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text color="gray.700" fontSize="xl">
                    Step 2️⃣ Check your CSV data example
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>

              <AccordionPanel p="4" alignItems="center">
                <Step2Check parsedData={parsedData} dataHeader={dataHeader} />
              </AccordionPanel>
            </AccordionItem>
          </Box>

          <Box alignSelf="center" w="5xl" p="0" m="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
            <AccordionItem isDisabled={!dataHeader || !parsedData} borderWidth="0px !important">
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text color="gray.700" fontSize="xl">
                    Step 3️⃣ For each of CSV row, do...
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              
              <AccordionPanel p="4" alignItems="center">
                <Step3ForEach parsedData={parsedData} dataHeader={dataHeader} />
              </AccordionPanel>
            </AccordionItem>
          </Box>

          <Box alignSelf="center" w="5xl" p="0" m="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
            <AccordionItem isDisabled={!dataHeader || !parsedData} borderWidth="0px !important">
              <AccordionButton>
                <Box flex="1" display="flex" flexDirection="row" alignItems="center" textAlign="left">
                  {url && requestMethod && dataHeader && parsedData ? 
                    <CheckCircleIcon mr="4px" w={6} h={6} color="green.400"/> :
                    <WarningIcon mr="4px" w={6} h={6} color="yellow.400"/>
                  }
                  <Text color="gray.700" fontSize="xl">
                    Step 4️⃣ Execute 
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>

              <AccordionPanel p="4" alignItems="center">
                <Step4Execute parsedData={parsedData} dataHeader={dataHeader} />
              </AccordionPanel>
            </AccordionItem>
          </Box>

        </Accordion>
      {/* </Box> */}
    </Container>
  )
}

export default Upload