import { Box, Button, Divider, Heading, Stat, StatGroup, StatLabel, StatNumber, Table, TableCaption, Tbody, Th, Thead, Tr } from '@chakra-ui/react'
import axios, { Method } from 'axios'
import handlebars from 'handlebars'
import React, {FC, useEffect, useState} from 'react'

type Step4ExecuteType = {
  parsedData: { [key: string]: any }[] | undefined,
  dataHeader: string[] | undefined
}

const Step4Execute: FC<Step4ExecuteType> = ({ parsedData, dataHeader }) => {
  const [executionResults, setExecutionResults] = useState<{ [key: string]: any }[]>([])

  const [requestMethod, setRequestMethod] = useState<Method>()
  const [url, setUrl] = useState<string>()
  const [body, setBody] = useState<string>()
  const [headers, setHeaders] = useState<string>()

  useEffect(() => {
    setRequestMethod((document.querySelector('input[name="requestMethod"]:checked') as HTMLInputElement)?.value as Method)
    setUrl((document.getElementById('url') as HTMLInputElement)?.value)
    setBody((document.getElementById('body') as HTMLTextAreaElement)?.value)
    setHeaders((document.getElementById('headers') as HTMLTextAreaElement)?.value)
  }, [])

  const wait = (timeToDelay: number) => new Promise((resolve) => setTimeout(resolve, timeToDelay))

  const executeAllRows = async (e: any) => {
    e.preventDefault()

    console.log(requestMethod, url, body)

    if (url && requestMethod && parsedData && dataHeader) {

      for (let i in parsedData) {
        const row = parsedData[i]
        let res: any

        try {
          const urlRegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
          if (!urlRegExp.test(url)) {
            throw 'URL not a valid HTTP/HTTPS URL'
          }
  
          if (!(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(requestMethod))) {
            throw 'Invalid request method'
          }

          const urlCompile = handlebars.compile(body)
          const replacedUrl = urlCompile({ row: row })

          const headersCompile = handlebars.compile(body)
          const replacedHeaders = headersCompile({ row: row })

          const bodyCompile = handlebars.compile(body)
          const replacedBody = bodyCompile({ row: row })
    
          const bodyJson = JSON.parse(replacedBody)
          const headersJson = JSON.parse(replacedHeaders || '{}')
  
          res = await axios.request({
            method: 'post',
            url: '/api/executeRow',
            headers: {
              'content-type': 'application/json'
            },
            data: {
              url: replacedUrl,
              method: requestMethod,
              headers: headersJson,
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