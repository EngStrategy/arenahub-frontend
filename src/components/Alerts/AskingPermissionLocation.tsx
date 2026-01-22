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
            className="!mb-6"
            message={
                <Flex
                    className="flex-col sm:flex-row sm:items-center sm:justify-between w-full"
                >
                    <div className="flex-grow sm:mr-4">
                        <Typography.Text strong className='!text-lg'>
                            Encontre arenas perto de você
                        </Typography.Text>
                        <Typography.Paragraph type="secondary" className="!mb-1">
                            Permita o acesso à sua localização para descobrirmos as melhores opções na sua área.
                        </Typography.Paragraph>
                    </div>

                    <ButtonPrimary
                        text='Usar minha localização'
                        onClick={handleRequestLocation}
                        loading={isAskingPermission}
                        className="mt-3 sm:mt-0"
                    />
                </Flex>
            }
        />
    )
}
