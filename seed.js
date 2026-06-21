const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: '209.50.229.30',
  port: 5437,
  user: 'user_MBGpxe',
  password: 'password_pGBMYK',
  database: 'postgres',
  ssl: false,
});

async function seed() {
  const client = await pool.connect();
  console.log('🌱 Iniciando seed...\n');

  try {
    // 1. Criar barbearia
    const { rows: existing } = await client.query(
      `SELECT id FROM barbershops WHERE slug = 'minha-barbearia' LIMIT 1`
    );

    let barbershopId;

    if (existing[0]) {
      barbershopId = existing[0].id;
      console.log('✅ Barbearia já existe:', barbershopId);
    } else {
      const { rows: [barbershop] } = await client.query(`
        INSERT INTO barbershops (name, slug, phone, email, address, city, state, timezone)
        VALUES ('Minha Barbearia', 'minha-barbearia', '(11) 99999-9999', 'contato@minha-barbearia.com', 
                'Rua das Flores, 123', 'São Paulo', 'SP', 'America/Sao_Paulo')
        RETURNING id
      `);
      barbershopId = barbershop.id;
      console.log('✅ Barbearia criada:', barbershopId);
    }

    // 2. Criar usuário admin
    const { rows: existingUser } = await client.query(
      `SELECT id FROM users WHERE email = 'admin@barberbook.com' LIMIT 1`
    );

    if (existingUser[0]) {
      console.log('✅ Usuário admin já existe');
    } else {
      const passwordHash = await bcrypt.hash('123456', 10);
      await client.query(`
        INSERT INTO users (barbershop_id, name, email, password_hash, role, is_active)
        VALUES ($1, 'Administrador', 'admin@barberbook.com', $2, 'owner', true)
      `, [barbershopId, passwordHash]);
      console.log('✅ Usuário admin criado');
    }

    // 3. Criar horários de funcionamento padrão
    const { rows: existingHours } = await client.query(
      `SELECT id FROM working_hours WHERE barbershop_id = $1 LIMIT 1`, [barbershopId]
    );

    if (!existingHours[0]) {
      for (let day = 0; day <= 6; day++) {
        const isOpen = day !== 0; // Fechado no domingo
        await client.query(`
          INSERT INTO working_hours (barbershop_id, day_of_week, is_open, open_time, close_time)
          VALUES ($1, $2, $3, '08:00', '18:00')
          ON CONFLICT (barbershop_id, user_id, day_of_week) DO NOTHING
        `, [barbershopId, day, isOpen]);
      }
      console.log('✅ Horários de funcionamento criados');
    }

    // 4. Criar configurações de agendamento padrão
    const { rows: existingScheduling } = await client.query(
      `SELECT id FROM scheduling_settings WHERE barbershop_id = $1 LIMIT 1`, [barbershopId]
    );

    if (!existingScheduling[0]) {
      await client.query(`
        INSERT INTO scheduling_settings (barbershop_id, booking_window_days, min_advance_minutes, 
          slot_duration_minutes, online_booking_enabled, online_booking_url_slug, 
          allow_client_cancel, cancel_limit_hours, allow_reschedule, reschedule_limit_hours,
          ask_client_notes, require_client_phone)
        VALUES ($1, 30, 60, 30, true, 'minha-barbearia', true, 2, true, 2, true, true)
      `, [barbershopId]);
      console.log('✅ Configurações de agendamento criadas');
    }

    // 5. Criar configurações do sistema
    const { rows: existingSystem } = await client.query(
      `SELECT id FROM system_settings WHERE barbershop_id = $1 LIMIT 1`, [barbershopId]
    );

    if (!existingSystem[0]) {
      await client.query(`
        INSERT INTO system_settings (barbershop_id, primary_color, language, 
          notify_new_booking, notify_cancellation, notify_reminder, reminder_hours_before)
        VALUES ($1, '#6366F1', 'pt-BR', true, true, true, 24)
      `, [barbershopId]);
      console.log('✅ Configurações do sistema criadas');
    }

    // 6. Criar alguns serviços de exemplo
    const { rows: existingServices } = await client.query(
      `SELECT id FROM services WHERE barbershop_id = $1 LIMIT 1`, [barbershopId]
    );

    if (!existingServices[0]) {
      const servicos = [
        { name: 'Corte Simples', price: 35.00, duration: 30, desc: 'Corte tradicional com tesoura ou máquina' },
        { name: 'Corte + Barba', price: 65.00, duration: 60, desc: 'Corte completo com aparação da barba' },
        { name: 'Barba',         price: 35.00, duration: 30, desc: 'Aparação e modelagem da barba' },
        { name: 'Degradê',       price: 45.00, duration: 45, desc: 'Corte degradê com acabamento perfeito' },
        { name: 'Sobrancelha',   price: 15.00, duration: 15, desc: 'Aparação e design das sobrancelhas' },
      ];

      for (const svc of servicos) {
        await client.query(`
          INSERT INTO services (barbershop_id, name, description, price, duration_minutes, is_active, is_online_available)
          VALUES ($1, $2, $3, $4, $5, true, true)
        `, [barbershopId, svc.name, svc.desc, svc.price, svc.duration]);
      }
      console.log('✅ Serviços de exemplo criados');
    }

    // 7. Criar alguns clientes de exemplo
    const { rows: existingClients } = await client.query(
      `SELECT id FROM clients WHERE barbershop_id = $1 LIMIT 1`, [barbershopId]
    );

    if (!existingClients[0]) {
      const clientes = [
        { name: 'João Silva',       phone: '(11) 99876-5432', email: 'joao@email.com' },
        { name: 'Pedro Alves',      phone: '(11) 98765-4321', email: 'pedro@email.com' },
        { name: 'Carlos Ferreira',  phone: '(11) 97654-3210', email: null },
        { name: 'Rafael Costa',     phone: '(11) 96543-2109', email: 'rafael@email.com' },
        { name: 'Bruno Martins',    phone: '(11) 95432-1098', email: null },
      ];

      for (const cli of clientes) {
        await client.query(`
          INSERT INTO clients (barbershop_id, name, phone, email, total_visits)
          VALUES ($1, $2, $3, $4, $5)
        `, [barbershopId, cli.name, cli.phone, cli.email, Math.floor(Math.random() * 20)]);
      }
      console.log('✅ Clientes de exemplo criados');
    }

    console.log('\n🎉 Seed concluído com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:  admin@barberbook.com');
    console.log('🔑 Senha:  123456');
    console.log('🌐 URL:    http://localhost:3000');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('❌ Erro no seed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
