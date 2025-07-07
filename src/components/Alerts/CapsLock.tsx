import { Alert } from 'antd'
import React from 'react'

export default function CapsLock() {
    return <Alert message="CapsLock está ativado" type="warning" showIcon className='!text-orange-400 !mb-4 transition-opacity duration-300 animate-pulse text-sm font-medium' />
}
