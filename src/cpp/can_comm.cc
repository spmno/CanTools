#include <stdio.h>
#include <assert.h>

#include "can_comm.h"

can_comm::can_comm(const uint8_t _dev_type, const uint8_t _dev_idx)
	: dev_type_(_dev_type)
	, dev_idx_(_dev_idx)
{
}

can_comm::~can_comm(void)
{
	close();
}

int32_t can_comm::open(void)
{
	if (STATUS_OK != OpenDevice(dev_type_, dev_idx_, 0))
	{
		printf("Open CAN device failed!\n");
		return -1;
	}
		
	return 0;
}

int32_t can_comm::close(void)
{
	if (STATUS_OK != CloseDevice(dev_type_, dev_idx_))
	{
		printf("Close CAN device failed!\n");
		return -1;
	}

	return 0;
}

int32_t can_comm::init(const uint8_t _chl)
{
	INIT_CONFIG cfg;
	cfg.AccCode = 0;
	cfg.AccMask = 0xffffff;
	cfg.Filter = 0;
	cfg.Timing0 = 0;
	cfg.Timing1 = 0x1c;
	cfg.Mode = 0;

	if (STATUS_OK != InitCAN(dev_type_, dev_idx_, _chl, &cfg))
	{
		printf("Initialize CAN failed!\n");
		return -1;
	}
		
	if (STATUS_OK != StartCAN(dev_type_, dev_idx_, _chl))
	{
		printf("Start CAN failed!\n");
		return -1;
	}
		
	return 0;
}

uint8_t can_comm::receive(const uint8_t _chl, uint32_t* const _id, uint8_t* const _buf, const uint8_t _size)
{
	assert(NULL != _buf);

	CAN_OBJ frame;
	uint8_t size = 0;

	if (1 != Receive(dev_type_, dev_idx_, _chl, &frame, 1, 0))
		return 0;

	*_id = frame.ID;
	size = _size > frame.DataLen ? frame.DataLen : _size;
	memcpy(_buf, frame.Data, size);

	return size;
}

uint8_t can_comm::transmit(const uint8_t _chl, const uint32_t _id, const uint8_t *const _buf, const uint8_t _size)
{
	assert(NULL != _buf);

	CAN_OBJ frame;

	memset(&frame, 0, sizeof(CAN_OBJ));
	frame.ID = _id;
	frame.SendType = 0;
	frame.RemoteFlag = 0;
	frame.ExternFlag = 0;
	frame.DataLen = _size > 8 ? 8 : _size;
	memcpy(frame.Data, _buf, frame.DataLen);
	std::lock_guard<std::mutex> guard(tx_mutex_);
	if (1 != Transmit(dev_type_, dev_idx_, _chl, &frame, 1))
	{
		printf("CAN send failed!\n");
		return 0;
	}

	return _size;
}
