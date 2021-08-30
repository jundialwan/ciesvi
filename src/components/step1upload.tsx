import React, { FC, useRef } from 'react'
import { CSVReader } from 'react-papaparse'

type Step1UploadType = {
  setDataHeader: React.Dispatch<React.SetStateAction<string[] | undefined>>,
  setParsedData: React.Dispatch<React.SetStateAction<{ [key: string]: any; }[] | undefined>>
}

const Step1Upload: FC<Step1UploadType> = ({ setDataHeader, setParsedData }) => {
  const uploadBtnRef = useRef<any>(null)

  const handleOpenDialog = (e: any) => {
    // Note that the ref is set async, so it might be null at some point 
    if (uploadBtnRef?.current) {
      uploadBtnRef.current.open(e)
    }
  }

  const handleOnDrop = (data: any) => {
    console.log(data)

    setParsedData(data.map((data: any) => data.data))
    setDataHeader(Object.keys(data[0].data))
  }

  const handleOnError = (err: any) => {
    console.log(err)
  }

  const handleOnRemoveFile = (data: any) => {
    console.log('---------------------------')
    console.log(data)
    console.log('---------------------------')
  }

  return (
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
  )
}

export default Step1Upload