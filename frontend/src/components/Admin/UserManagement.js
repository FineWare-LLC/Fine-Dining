import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import React, { useState } from 'react';

// GraphQL Queries
const GET_USERS = gql`
  query GetUsers($page: Int, $limit: Int) {
    getUsers(page: $page, limit: $limit) {
      id
      name
      email
      role
      accountStatus
      createdAt
      updatedAt
    }
  }
`;

// GraphQL Mutations
const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      accountStatus
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
      accountStatus
    }
  }
`;

export default function UserManagement() {
    const [page, setPage] = useState(1);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'USER',
        password: '',
    });

    const { data, loading, error, refetch } = useQuery(GET_USERS, {
        variables: { page, limit: 50 },
    });

    const [deleteUser] = useMutation(DELETE_USER, {
        onCompleted: () => refetch(),
    });

    const [createUser] = useMutation(CREATE_USER, {
        onCompleted: () => {
            refetch();
            setOpenDialog(false);
            setFormData({ name: '', email: '', role: 'USER', password: '' });
        },
    });

    const [updateUser] = useMutation(UPDATE_USER, {
        onCompleted: () => {
            refetch();
            setOpenDialog(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'USER', password: '' });
        },
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await deleteUser({ variables: { id } });
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
        });
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        if (editingUser) {
            await updateUser({
                variables: {
                    id: editingUser.id,
                    input: {
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                    },
                },
            });
        } else {
            await createUser({
                variables: {
                    input: {
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        password: formData.password,
                    },
                },
            });
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">Error loading users: {error.message}</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">User Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
          Add User
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.getUsers?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role}
                                        color={user.role === 'ADMIN' ? 'error' : user.role === 'PREMIUM' ? 'warning' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.accountStatus}
                                        color={user.accountStatus === 'ACTIVE' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(user)} size="small">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(user.id)} size="small" color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={formData.role}
                            label="Role"
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <MenuItem value="USER">User</MenuItem>
                            <MenuItem value="PREMIUM">Premium</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                        </Select>
                    </FormControl>
                    {!editingUser && (
                        <TextField
                            margin="dense"
                            label="Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
