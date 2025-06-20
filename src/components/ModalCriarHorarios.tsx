"use client";

import React, { useEffect } from 'react';
import {
    Modal,
    Form,
    Button,
    TimePicker,
    InputNumber,
    Select,
    Typography,
} from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ButtonCancelar } from './ButtonCancelar';
import { ButtonPrimary } from './ButtonPrimary';

const { Title } = Typography;

interface ModalCriarHorariosProps {
    open: boolean;
    onCancel: () => void;
    onOk: (values: any) => void;
    day: {
        dia: string;
        horarios: any[];
    } | null;
}

const ModalCriarHorarios: React.FC<ModalCriarHorariosProps> = ({ open, onCancel, onOk, day }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (day && open) {
            const horariosParaForm = day.horarios.map(h => ({
                ...h,
                inicio: h.inicio ? dayjs(h.inicio, 'HH:mm') : null,
                fim: h.fim ? dayjs(h.fim, 'HH:mm') : null,
            }));
            form.setFieldsValue({ horarios: horariosParaForm });
        } else {
            form.resetFields();
        }
    }, [day, open, form]);

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                const horariosParaSalvar = values.horarios.map((h: any) => ({
                    ...h,
                    inicio: h.inicio ? dayjs(h.inicio).format('HH:mm') : null,
                    fim: h.fim ? dayjs(h.fim).format('HH:mm') : null,
                }));
                onOk({ horarios: horariosParaSalvar });
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title={<Title level={4}>{day?.dia}</Title>}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            width={700}
            footer={[
                <ButtonCancelar text='Cancelar' key="back" onClick={onCancel} />,
                <ButtonPrimary text='Salvar' key="submit" type="primary" onClick={handleOk} />
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                initialValues={{ horarios: [{}] }}
            >
                <Form.List name="horarios" >
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="border-b-2 border-green-200 flex w-full items-center gap-2 mb-4 rounded-lg">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 flex-grow">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'inicio']}
                                            label="Início"
                                            rules={[{ required: true, message: 'Obrigatório' }]}
                                        >
                                            <TimePicker format="HH:mm" minuteStep={30} placeholder='08:00' style={{ width: '100%' }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'fim']}
                                            label="Fim"
                                            rules={[{ required: true, message: 'Obrigatório' }]}
                                        >
                                            <TimePicker format="HH:mm" minuteStep={30} placeholder='12:00' style={{ width: '100%' }} />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'valor']}
                                            label="Valor"
                                            rules={[{ required: true, message: 'Obrigatório' }]}
                                        >
                                            <InputNumber
                                                prefix="R$ "
                                                decimalSeparator=","
                                                precision={2}
                                                placeholder='00,00'
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'status']}
                                            label="Status"
                                            rules={[{ required: true, message: 'Obrigatório' }]}
                                        >
                                            <Select
                                                placeholder="Selecione"
                                                style={{ width: '100%' }}
                                                options={[
                                                    { value: 'disponivel', label: 'Disponível' },
                                                    { value: 'bloqueado', label: 'Bloqueado' },
                                                ]}
                                            />
                                        </Form.Item>
                                    </div>

                                    <Button type="text" danger icon={<CloseOutlined />} onClick={() => remove(name)} />
                                </div>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} className="!border-gray-400">
                                    Adicionar intervalo
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};

export default ModalCriarHorarios;