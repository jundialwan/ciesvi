// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { body: reqBody } = req
    const { method, url, body, headers } = reqBody

    console.log({ method, url, body })

    const reqRes = await axios.request({
      method,
      url,
      data: body,
      headers: {
        'content-type': 'application/json',
        ...headers
      }
    })

    console.log({ status: reqRes.status, data: reqRes.data, headers: reqRes.headers })

    if (reqRes.status >=200 && reqRes.status < 300) {
      return res.status(200).json({ status: 'success' })
    } else {
      return res.status(reqRes.status).json({ status: 'error', data: { status: reqRes.status, data: reqRes.data } })
    }
  }

  return res.status(405).json({})
}
