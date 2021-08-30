import { Box, Button, Code, Divider, FormControl, FormHelperText, FormLabel, Heading, HStack, Input, Radio, RadioGroup, Stack, Textarea } from '@chakra-ui/react'
import axios from 'axios'
import handlebars from 'handlebars'
import React, { FC, useState } from 'react'

type Step3ForEachType = {
  parsedData: { [key: string]: any }[] | undefined,
  dataHeader: string[] | undefined
}

const Step3ForEach: FC<Step3ForEachType> = ({ parsedData, dataHeader }) => {
  const [hitAPIError, setHitAPIError] = useState<string>()
  const [hitAPIresult, setHitAPIResult] = useState<any>()

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

  return (
    <>
      <Box alignSelf="center" p="4" mb="4" borderRadius="md" borderColor="gray.300" borderWidth="1px">
        <RadioGroup defaultValue="1">
          <Stack spacing={4} direction="row">
            <Radio value="1">Hit a HTTPS REST API endpoint with row and custom data</Radio>
            <Radio value="2" isDisabled>Fill string template with row data (probably soon)</Radio>
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
    </>
  )
}

export default Step3ForEach