
Now that the bead trajectories for the bead-spring model described above can be simulated for any homogeneous flow, we wish to relate the average configuration of the polymer chain to the macroscopic stress the fluid exhibits.  There are two modes of momentum transfer that give rise to a contribution to the stress caused by the polymer chain.  First, there is the tension in the springs which transmits force between the beads.  Stress is a force per unit area and these microscopic intra-molecular forces manifest themselves as stress.  Second, there is the momentum transport caused by the bead motion.  As the bead move about randomly, they cause momentum to be transferred giving rise to an isotropic contribution to the stress tensor similar to a pressure effect.  When we take these two contribution into account, the stress tensor due to the polymer chain is given by the Kramers equation:

$$
\tau (t) = -n \sum_{k=1}^{N-1} \left \langle Q_k F_k \right \rangle (N-1) nkT \delta
$$

where n is the number density of polymer chains in solution and $\delta$ is the unit tensor.  The angular brackets indicate an average over all possible configurations.  In our simulation we achieve this by time averaging the polymer configurations until a steady state is reached.