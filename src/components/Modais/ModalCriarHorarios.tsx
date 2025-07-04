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
import { ButtonCancelar } from '../Buttons/ButtonCancelar';
import { ButtonPrimary } from '../Buttons/ButtonPrimary';
import { DiaDaSemana } from '@/app/api/entities/quadra';

const { Title } = Typography;

interface ModalCriarHorariosProps {
    open: boolean;
    onCancel: () => void;
    onOk: (values: any) => void;
    day: {
        diaDaSemana: DiaDaSemana;
        intervalosDeHorario: any[];
    } | null;
}

const formatarDiaSemana = (dia: DiaDaSemana) => {
    const mapa = {
        DOMINGO: "Domingo", SEGUNDA: "Segunda-feira", TERCA: "Terça-feira",
        QUARTA: "Quarta-feira", QUINTA: "Quinta-feira", SEXTA: "Sexta-feira", SABADO: "Sábado"
    };
    return mapa[dia] || dia;
};

const ModalCriarHorarios: React.FC<ModalCriarHorariosProps> = ({ open, onCancel, onOk, day }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && day) {
            if (!day.intervalosDeHorario || day.intervalosDeHorario.length === 0) {
                form.setFieldsValue({ horarios: [{ status: 'DISPONIVEL', valor: null, inicio: null, fim: null }] });
            } else {
                const horariosParaForm = day.intervalosDeHorario.map(h => ({
                    ...h,
                    inicio: h.inicio ? dayjs(h.inicio, 'HH:mm') : null,
                    fim: h.fim ? dayjs(h.fim, 'HH:mm') : null,
                }));
                form.setFieldsValue({ horarios: horariosParaForm });
            }
        } else {
            form.resetFields();
        }
    }, [open, day, form]);

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                interface HorarioFormValues {
                    inicio: dayjs.Dayjs | null;
                    fim: dayjs.Dayjs | null;
                    valor: number | null;
                    status: 'DISPONIVEL' | 'INDISPONIVEL' | 'MANUTENCAO';
                }

                interface HorarioParaSalvar {
                    inicio: string | null;
                    fim: string | null;
                    valor: number | null;
                    status: 'DISPONIVEL' | 'INDISPONIVEL' | 'MANUTENCAO';
                }

                const horariosParaSalvar: HorarioParaSalvar[] = values.horarios
                    ? (values.horarios as HorarioFormValues[]).map((h: HorarioFormValues) => ({
                        ...h,
                        inicio: h.inicio ? dayjs(h.inicio).format('HH:mm') : null,
                        fim: h.fim ? dayjs(h.fim).format('HH:mm') : null,
                    })).filter((h: HorarioParaSalvar) => h.inicio && h.fim)
                    : [];
                onOk({ horarios: horariosParaSalvar });
            })
            .catch(info => {
                console.log('Falha na validação:', info);
            });
    };

    return (
        <Modal
            title={<Title level={4}>{day ? formatarDiaSemana(day.diaDaSemana) : ''}</Title>}
            open={open}
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
            >
                <Form.List name="horarios" >
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="border-b border-green-300 pb-2 flex w-full items-center gap-2 mb-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 flex-grow">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'inicio']}
                                            label="Início"
                                            rules={[{ required: true, message: 'Obrigatório!' }]}
                                        >
                                            <TimePicker format="HH:mm" minuteStep={30} placeholder='08:00' style={{ width: '100%' }} />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'fim']}
                                            label="Fim"
                                            dependencies={['inicio']}
                                            rules={[
                                                { required: true, message: 'Obrigatório!' },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        const inicioValue = getFieldValue(['horarios', name, 'inicio']);

                                                        if (!value || !inicioValue) {
                                                            return Promise.resolve();
                                                        }

                                                        const fimTime = dayjs.isDayjs(value) ? value : dayjs(value, "HH:mm");
                                                        const inicioTime = dayjs.isDayjs(inicioValue) ? inicioValue : dayjs(inicioValue, "HH:mm");

                                                        if (fimTime.isBefore(inicioTime) || fimTime.isSame(inicioTime)) {
                                                            return Promise.reject(new Error('O horário final deve ser maior que o inicial!'));
                                                        }

                                                        return Promise.resolve();
                                                    },
                                                }),
                                            ]}
                                        >
                                            <TimePicker format="HH:mm" minuteStep={30} placeholder='12:00' style={{ width: '100%' }} />
                                        </Form.Item>

                                        <Form.Item {...restField} name={[name, 'valor']} label="Valor (R$)" rules={[{ required: true, message: 'Obrigatório!' }]}>
                                            <InputNumber prefix="R$ " decimalSeparator="," precision={2} placeholder='100,00' style={{ width: '100%' }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'status']} label="Status" rules={[{ required: true, message: 'Obrigatório!' }]}>
                                            <Select placeholder="Selecione" style={{ width: '100%' }} options={[{ value: 'DISPONIVEL', label: 'Disponível' }, { value: 'INDISPONIVEL', label: 'Indisponível' }, { value: 'MANUTENCAO', label: 'Manutenção' }]} />
                                        </Form.Item>
                                    </div>
                                    <Button type="text" danger icon={<CloseOutlined />} onClick={() => remove(name)} className="self-center mt-6" />
                                </div>
                            ))}
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add({ status: 'DISPONIVEL', valor: null, inicio: null, fim: null })}
                                    block
                                    icon={<PlusOutlined />}
                                    className="!border-gray-400"
                                >
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