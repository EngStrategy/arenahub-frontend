import { Alert, Flex, Typography } from 'antd'
import React from 'react'
import { ButtonPrimary } from '../Buttons/ButtonPrimary'
import { IoLocationOutline } from 'react-icons/io5';

export function AskingPermissionLocation({ setIsLocationBannerVisible, handleRequestLocation, isAskingPermission }: {
    readonly setIsLocationBannerVisible: React.Dispatch<React.SetStateAction<boolean>>;
    readonly handleRequestLocation: () => void;
    readonly isAskingPermission: boolean;
}) {
    return (
        <Alert
            type="info"
            showIcon
            icon={<IoLocationOutline />}
            closable
            onClose={() => setIsLocationBannerVisible(false)}
            className="!mb-4 !py-2 !px-3 sm:!py-3 sm:!px-4"
            message={
                <Flex
                    className="flex-col sm:flex-row sm:items-center sm:justify-between w-full"
                >
                    <div className="flex-grow sm:mr-4">
                        <Typography.Text strong className='!text-sm sm:!text-lg'>
                            Encontre arenas perto de você
                        </Typography.Text>
                        <Typography.Paragraph type="secondary" className="!mb-1 !text-xs sm:!text-sm !leading-tight mt-1">
                            Permita o acesso à localização para descobrirmos as melhores opções.
                        </Typography.Paragraph>
                    </div>

                    <ButtonPrimary
                        text='Ativar'
                        onClick={handleRequestLocation}
                        loading={isAskingPermission}
                        className="mt-2 sm:mt-0 w-full sm:w-auto !text-xs sm:!text-sm !py-1 sm:!py-2"
                    />
                </Flex>
            }
        />
    )
}
