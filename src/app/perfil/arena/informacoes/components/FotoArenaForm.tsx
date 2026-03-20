import React from "react";
import { Form, Col, Flex, Dropdown, Avatar, Typography, Upload, MenuProps, UploadProps, GetProp } from "antd";
import { PictureOutlined, EditOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface FotoArenaFormProps {
  imageUrl: string | null;
  menuItems: MenuProps["items"];
  beforeUpload: (file: FileType) => boolean;
  handleChange: UploadProps["onChange"];
  handlePreview: (file: any) => Promise<void>;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  uploadButton: React.ReactNode;
}

export const FotoArenaForm = ({
  imageUrl,
  menuItems,
  beforeUpload,
  handleChange,
  handlePreview,
  isSubmitting,
  isAuthenticated,
  uploadButton,
}: FotoArenaFormProps) => {
  return (
    <Col xs={24} md={12}>
      <Form.Item label="Foto ou logomarca da arena" className="!mb-2">
        <Flex align="center" gap="middle">
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <div
              className="relative group cursor-pointer"
              title="Clique para alterar a foto"
            >
              <Avatar
                size={64}
                src={imageUrl || undefined}
                icon={<PictureOutlined />}
                className="flex-shrink-0"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300">
                <EditOutlined className="!text-white !text-xl !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-300" />
              </div>
            </div>
          </Dropdown>
          <Flex vertical>
            <Typography.Text
              type="secondary"
              style={{ fontSize: "12px" }}
            >
              Recomendamos uma imagem quadrada para melhor visualização.
            </Typography.Text>
            <ImgCrop rotationSlider>
              <Upload
                showUploadList={false}
                beforeUpload={beforeUpload as any}
                onChange={handleChange}
                onPreview={handlePreview as any}
                maxCount={1}
                multiple={false}
                accept="image/jpeg,image/png"
                disabled={isSubmitting || !isAuthenticated}
              >
                {uploadButton}
              </Upload>
            </ImgCrop>
          </Flex>
        </Flex>
      </Form.Item>
    </Col>
  );
};
