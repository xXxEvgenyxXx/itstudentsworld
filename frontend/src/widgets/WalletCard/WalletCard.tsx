import { Card, Statistic, Button, Space } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Wallet } from '@/entities/user';

interface Props {
  wallet: Wallet;
  shopRoute: string;
}

export function WalletCard({ wallet, shopRoute }: Props) {
  return (
    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Statistic
        title="Баланс кошелька"
        value={Number(wallet.balance)}
        precision={2}
        prefix={<WalletOutlined />}
        suffix="монет"
        valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
      />
      
      <Space style={{ marginTop: 24, width: '100%' }} size="middle">
        <Link to="#" style={{ flex: 1 }}>
          <Button type="default" block>Пополнить</Button>
        </Link>
        <Link to={shopRoute} style={{ flex: 1 }}>
          <Button type="primary" block>В магазин</Button>
        </Link>
      </Space>
    </Card>
  );
}