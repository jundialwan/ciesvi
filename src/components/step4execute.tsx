import { Box, Button, Divider, Heading, Stat, StatGroup, StatLabel, StatNumber, Table, TableCaption, Tbody, Th, Thead, Tr } from '@chakra-ui/react'
import axios from 'axios'
import handlebars from 'handlebars'
import React, {FC, useState} from 'react'

type Step4ExecuteType = {
  parsedData: { [key: string]: any }[] | undefined,
  dataHeader: string[] | undefined
}

const Step4Execute: FC<Step4ExecuteType> = ({ parsedData, dataHeader }) => {
  const [executionResults, setExecutionResults] = useState<{ [key: string]: any }[]>([])
  const requestMethod: any = (document.querySelector('input[name="requestMethod"]:checked')  as HTMLInputElement)?.value
  const url = (document.getElementById('url') as HTMLInputElement)?.value
  const body = (document.getElementById('body') as HTMLTextAreaElement)?.value

  const wait = (timeToDelay: number) => new Promise((resolve) => setTimeout(resolve, timeToDelay))

  const executeAllRows = async (e: any) => {
    e.preventDefault()

    console.log(requestMethod, url, body)

    if (url && requestMethod && parsedData && dataHeader) {

      for (let i in parsedData) {
        const row = parsedData[i]
        let res: any

        try {
          const bodyCompile = handlebars.compile(body)
          const replacedBody = bodyCompile({ row: row })
    
          const urlRegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
          const bodyJson = JSON.parse(replacedBody)
  
          if (!urlRegExp.test(url)) {
            throw 'URL not a valid HTTP/HTTPS URL'
          }
  
          if (!(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(requestMethod))) {
            throw 'Invalid request method'
          }
  
          res = await axios.request({
            method: 'POST',
            url: '/api/executeRow',
            headers: {
              'content-type': 'application/json'
            },
            data: {
              url,
              method: requestMethod,
              body: bodyJson
            }
          })
  
          if (res.status >=200 && res.status < 300) {
            setExecutionResults(prevState => prevState ? ([
              ...prevState,
              {
                status: 'success',
                reason: '',
                apiResult: JSON.stringify({
                  status: res.status,
                  data: res.data,
                  headers: res.headers
                }),
                rowData: JSON.stringify(row)
              }
            ]) : prevState)
          } else {
            throw `${res.status} ${res.statusText} - ${res.data}`
          }
        } catch(e) {
          setExecutionResults(prevState => prevState ? ([
            ...prevState,
            {
              status: 'error',
              reason: e,
              apiResult: JSON.stringify({
                status: res.status,
                data: res.data,
                headers: res.headers
              }),
              rowData: JSON.stringify(row)
            }
          ]) : prevState)
        }

        await wait(1240) // delay to prevent race condition on the receiving end
      }
    }
  }

  return (
    <>
      <Button mb="4" onClick={executeAllRows} colorScheme="blue">Execute all rows</Button>

      <Box alignSelf="center" p="4" mb="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
        <Heading as="h5" size="md">Results</Heading>
        <Divider mt="4" mb="4" />
        
        {
          parsedData && executionResults && executionResults.length > 0 ? 
            <>
              <Box alignSelf="center" p="4" mb="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
                <StatGroup>
                  <Stat>
                    <StatLabel>Total rows executed</StatLabel>
                    <StatNumber>{executionResults.length}</StatNumber>
                  </Stat>

                  <Stat>
                    <StatLabel>Success</StatLabel>
                    <StatNumber>{executionResults.filter(er => er.status === 'success').length}</StatNumber>
                  </Stat>

                  <Stat>
                    <StatLabel>Error</StatLabel>
                    <StatNumber>{executionResults.filter(er => er.status !== 'success').length}</StatNumber>
                  </Stat>
                </StatGroup>
              </Box>

              <Box alignSelf="center" overflowX="auto" p="4" mb="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
                <Table variant="striped" colorScheme="gray">
                  <TableCaption>Execution results</TableCaption>

                  <Thead>
                    <Tr>
                      <Th>Status</Th>
                      <Th>Reason</Th>
                      <Th>API Result</Th>
                      <Th>Row Data</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {executionResults.map((er, idx) => (
                      <Tr key={idx}>
                        <Th>{er.status}</Th>
                        <Th>{er.reason}</Th>
                        <Th>{er.apiResult}</Th>
                        <Th>{er.rowData}</Th>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </>
            : null
        }
      </Box>
    </>
  )
}

export default Step4Execute