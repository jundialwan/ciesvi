import { NextPage } from 'next'
import React, { useRef, useState } from 'react'
import { CSVReader } from 'react-papaparse'
import axios from 'axios'
import handlebars from 'handlebars'

import {
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionButton,
  AccordionPanel,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  Box,
  Text, 
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  RadioGroup,
  Stack,
  Radio,
  Divider,
  Input,
  HStack,
  Textarea,
  Button,
  Code,
  Container,
} from "@chakra-ui/react"

const Upload: NextPage = () => {
  const uploadBtnRef = useRef<any>(null)
  const [parsedData, setParsedData] = useState<{ [key: string]: any }[]>()
  const [dataHeader, setdataHeader] = useState<string[]>()
  const [hitAPIError, setHitAPIError] = useState<string>()
  const [hitAPIresult, setHitAPIResult] = useState<any>()
  const [executionResults, setExecutionResults] = useState<{ [key: string]: any }[]>([])

  const handleOpenDialog = (e: any) => {
    // Note that the ref is set async, so it might be null at some point 
    if (uploadBtnRef?.current) {
      uploadBtnRef.current.open(e)
    }
  }

  const handleOnDrop = (data: any) => {
    console.log(data)

    setParsedData(data.map((data: any) => data.data))
    setdataHeader(Object.keys(data[0].data))
  }

  const handleOnError = (err: any) => {
    console.log(err)
  }

  const handleOnRemoveFile = (data: any) => {
    console.log('---------------------------')
    console.log(data)
    console.log('---------------------------')
  }

  const onSubmitTestHitAPI = async (e: any) => {
    if (parsedData && dataHeader) {
      e.preventDefault()
      console.log(e.target.requestMethod.value)
      console.log(e.target.url.value)
      console.log(e.target.body.value)

      setHitAPIError('')
      setHitAPIResult('')
  
      const requestMethod = e.target.requestMethod.value
      const url = e.target.url.value
      const body = e.target.body.value
  
      
      try {
        const bodyCompile = handlebars.compile(body)
        console.log({ row: parsedData[0] })
        const replacedBody = bodyCompile({ row: parsedData[0] })
  
        const urlRegExp = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
        const bodyJson = JSON.parse(replacedBody)

        if (!urlRegExp.test(url)) {
          throw 'URL not a valid HTTP/HTTPS URL'
        }

        if (!(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(requestMethod))) {
          throw 'Invalid request method'
        }

        const res = await axios.request({
          method: requestMethod,
          url: url,
          headers: {
            'content-type': 'application/json'
          },
          data: bodyJson
        })

        if (res.status >=200 && res.status < 300) {
          setHitAPIResult(JSON.stringify({
            status: res.status,
            data: res.data,
            headers: res.headers
          }))
        } else {
          throw `${res.status} ${res.statusText} - ${res.data}`
        }
      } catch(e) {
        setHitAPIError(e)
      }
    }
  }

  const executeAllRows = async (e: any) => {
    e.preventDefault()

    const requestMethod: any = (document.querySelector('input[name="requestMethod"]:checked')  as HTMLInputElement)?.value
    const url = (document.getElementById('url') as HTMLInputElement)?.value
    const body = (document.getElementById('body') as HTMLTextAreaElement)?.value
    console.log(requestMethod, url, body)

    if (parsedData && dataHeader) {

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
            method: requestMethod,
            url: url,
            headers: {
              'content-type': 'application/json'
            },
            data: bodyJson
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
      }
    }
  }

  return (
    <Container maxW="container.lg" centerContent>
      <Box alignSelf="center" w="5xl" p="4" m="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
        <Accordion defaultIndex={[0]} allowMultiple>
          <AccordionItem>
            <AccordionButton bgColor="gray.200">
              <Box flex="1" textAlign="left">
                <Text color="gray.700" fontSize="xl">
                  Step 1️⃣ Upload your CSV
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            

            <AccordionPanel p="2">
              <CSVReader
                ref={uploadBtnRef}
                config={{
                  header: true
                }}
                onError={handleOnError}
                onFileLoad={handleOnDrop}
                noClick
                noDrag
                removeButtonColor="#659cef"
                onRemoveFile={handleOnRemoveFile}
              >
                {({ file }: { file: any }) => (
                  <aside
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      marginBottom: 10
                    }}
                  >
                    <button
                      type='button'
                      onClick={handleOpenDialog}
                      style={{
                        borderRadius: 0,
                        marginLeft: 0,
                        marginRight: 0,
                        width: '40%',
                        paddingLeft: 0,
                        paddingRight: 0
                      }}
                    >
                      Browse file
                    </button>
                    <div
                      style={{
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: '#ccc',
                        height: 45,
                        lineHeight: 2.5,
                        marginTop: 5,
                        marginBottom: 5,
                        paddingLeft: 13,
                        paddingTop: 3,
                        width: '60%'
                      }}
                    >
                      {file && file.name}
                    </div>
                    <button
                      style={{
                        borderRadius: 0,
                        marginLeft: 0,
                        marginRight: 0,
                        paddingLeft: 20,
                        paddingRight: 20
                      }}
                      onClick={handleOnRemoveFile}
                    >
                      Remove
                    </button>
                  </aside>
                )}
              </CSVReader>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem isDisabled={!dataHeader || !parsedData}>
            
            <AccordionButton bgColor="gray.200">
              <Box flex="1" textAlign="left">
                <Text color="gray.700" fontSize="xl">
                  Step 2️⃣ Check your CSV data example
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel p="4" alignItems="center">
              {
                parsedData && dataHeader ? 
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
                  : null
              }
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem isDisabled={!dataHeader || !parsedData}>
            <AccordionButton bgColor="gray.200">
              <Box flex="1" textAlign="left">
                <Text color="gray.700" fontSize="xl">
                  Step 3️⃣ For each of CSV row, do...
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            
            <AccordionPanel p="4" alignItems="center">
              <Box alignSelf="center" p="4" mb="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
                <RadioGroup defaultValue="1">
                  <Stack spacing={4} direction="row">
                    <Radio value="1">Hit a HTTPS REST API endpoint with row and custom data</Radio>
                    <Radio value="2" isDisabled>Fill this string template with row data (probably soon)</Radio>
                    <Radio value="3" isDisabled>Transform row data (...soon?)</Radio>
                  </Stack>
                </RadioGroup>
              </Box>

              <Box alignSelf="center" p="2" mb="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
                <Heading as="h5" size="md">Hit a HTTPS REST API endpoint with row and custom data</Heading>
                <Divider mt="4" mb="4" />

                <form onSubmit={onSubmitTestHitAPI} name="httpsAPIRequest">
                  <FormControl name="requestMethod" as="fieldset" mb="4">
                    <FormLabel as="legend">Request Type</FormLabel>
                    <RadioGroup name="requestMethod" defaultValue="POST">
                      <HStack spacing="24px">
                        <Radio name="requestMethod" value="GET">GET</Radio>
                        <Radio name="requestMethod" value="POST">POST</Radio>
                        <Radio name="requestMethod" value="PUT">PUT</Radio>
                        <Radio name="requestMethod" value="PATCH">PATCH</Radio>
                        <Radio name="requestMethod" value="DELETE">DELETE</Radio>
                      </HStack>
                    </RadioGroup>      
                  </FormControl>

                  <FormControl id="first-name" mb="4" isRequired>
                    <FormLabel>HTTPS URL</FormLabel>
                    <Input id="url" type="text" name="url" placeholder="https://" />
                  </FormControl>

                  <FormControl id="headers" mb="4">
                    <FormLabel>Request Headers</FormLabel>
                    <FormHelperText>{"'Content-Type: application/json' is added by default for non-GET request. Can not add extra header right now, coming soon."}</FormHelperText>
                  </FormControl>

                  <FormControl id="body" mb="4">
                    <FormLabel>Body (only json supported)</FormLabel>
                    <Textarea
                      id="body"
                      name="body"
                      placeholder={`{"mydata":1, "mydata": "{{{row[First Name]}}}"}`}
                      size="md"
                      resize="vertical"
                    />
                    <FormHelperText>You can access row data with handlebars syntax like {`{{{row.myData}}}`} or {`{{{row.[My Header]}}}`} (triple brackets). See header name in step 2. Invalid row data will be replaced by empty string.</FormHelperText>
                  </FormControl>

                  <Button type="submit" colorScheme="blue">Test with the first data</Button>
                  <br /><br />

                  {
                    hitAPIError ? 
                      <Code>{hitAPIError.toString()}</Code>
                      : null
                  }

                  {
                    hitAPIresult ? 
                      <Code>{hitAPIresult.toString()}</Code>
                      : null
                  }
                </form>

              </Box>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem isDisabled={!dataHeader || !parsedData}>
            <AccordionButton bgColor="gray.200">
              <Box flex="1" textAlign="left">
                <Text color="gray.700" fontSize="xl">
                  Step 4️⃣ Execute 
                </Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel p="4" alignItems="center">
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
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </Container>
  )
}

export default Upload