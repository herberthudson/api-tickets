const { Ticket } = require('../models');
const messageHandler = require('../constants/messageHandler');


class TicketController {
    async create(req, res) {
        const { user_id, category_id, subject, message, is_closed } = req.body;

        Ticket.create({
            user_id,
            category_id,
            subject,
            is_closed,
            TicketMessages: [{
                message,
                user_id
            }]
        }, {
            include: ['TicketMessages']
        })
            .then(ticket => {
                return res.json({
                    success: true,
                    data: ticket
                });
            })
            .catch(err => {
                return messageHandler.modelError(res, err);
            });
    }

    async index(req, res) {
        await Ticket.findAll()
            .then(tickets => {
                return res.json({
                    success: true,
                    data: tickets
                });
            })
            .catch(err => {
                return messageHandler.modelError(res, err);
            });
    }

    async getTicket(req, res) {
        const { ticket_id } = req.params;

        if (!ticket_id) {
            return res.status(400).json({
                success: false,
                message: 'You must provide a ticket_id.'
            });
        }

        Ticket.findByPk(ticket_id, {
            attributes: ['id', 'subject', 'is_closed'],
            include: [{
                association: 'User',
                attributes: ['name', 'email'],
            }, {
                association: 'Category',
                attributes: ['name'],
            }, {
                association: 'TicketMessages',
                attributes: ['id', 'message'],
                required: false,
                include: [{
                    association: 'User',
                    attributes: ['name', 'email'],
                },]
            }]
        })
            .then(ticket => {
                if (!ticket) {
                    return res.status(404).json({
                        success: false,
                        message: 'Ticket not found.'
                    });
                }

                return res.json({
                    success: true,
                    data: ticket
                });
            })
            .catch(err => {
                return messageHandler.modelError(res, err);
            });
    }

    async put(req, res) {
        const { ticket_id } = req.params;
        const { subject, category_id, is_closed } = req.body;

        if (!ticket_id || isNaN(ticket_id)) {
            return res.status(400).json({
                success: false,
                message: 'You must provide a ticket_id.'
            });
        }

        await Ticket.findByPk(ticket_id)
            .then(ticket => {
                if (!ticket) {
                    return res.status(404).json({
                        success: false,
                        message: 'Ticket not found.'
                    });
                }

                ticket.update({ subject, category_id, is_closed })
                    .then(ticket_updated => {
                        return res.status(200).json({
                            success: true,
                            data: ticket_updated
                        });
                    })
                    .catch(err => {
                        return messageHandler.modelError(res, err);
                    });
            })
            .catch(err => {
                return messageHandler.modelError(res, err);
            });
    }

    async delete(req, res) {
        const { ticket_id } = req.params;

        if (!ticket_id || isNaN(ticket_id)) {
            return res.status(400).json({
                success: false,
                message: 'You must provide a ticket_id.'
            });
        }

        await Ticket.findByPk(ticket_id)
            .then(ticket => {
                if (!ticket) {
                    return res.status(404).json({
                        success: false,
                        message: 'Ticket was not found.'
                    });
                }

                ticket.destroy();

                return res.status(200).json({
                    success: true,
                    message: 'Ticket was deleted.'
                });
            })
            .catch(err => {
                return messageHandler.modelError(res, err);
            });
    }
}


module.exports = new TicketController();
