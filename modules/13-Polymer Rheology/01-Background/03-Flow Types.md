

In order to investigate the polymer behavior, we need to choose the type of flow in which the polymer chain is suspended.  For this module, we have limited the flows to incompressible, two-dimensional, homogeneous flows.  This is a wide class of flows that demonstrate most of the flow environments a suspended polymer would encounter.  The velocity profile for these flows is given by the Cartesian components of the velocity vector:

$\mathbf{v}_x = \dot{\gamma}y$, $\mathbf{v}_y = a\dot{\gamma}x$, $\mathbf{v}_z = 0$  for  $a \le 0$

$\mathbf{v}_x = \dot{\gamma}\left( \sqrt{a}x+(1+a)y \right)$, $\mathbf{v}_y = -\sqrt{a}\dot{\gamma}x$ and $\mathbf{v}_z = 0$ for $a > 0$

where $\dot{\gamma}$ is the flow rate and $a$ is the flow-type parameter.  For positive values of $a$ the flow has been rotated so that the primary flow direction lies along the x-axis.  The flow rate is proportional to the local fluid speed while the flow-type parameter controls the shape of the streamlines.  The flow-type parameter varies between &plusmn;1.  The two velocity profiles are actually equivalent and only differ by a rotation.  We have defined the flow so that the primary flow direction is always in the x-direction.  This should help the user stay oriented when changing flow types.  Examples of different parameter values and the corresponding flow pattern created according to the velocity above are given below.  The module indicates the general shape of the fluid velocity and its relative magnitude.

<!--- a-1.png, a-0.5.png, a0.png a0.5.png, a1.png missing --->

| Streamline pattern | a &mdash; The Flow-Type Parameter |
| - | - |
| This flow is simply a rigid body rotation of the fluid.  There is no deformation.  The streamlines are circular as the fluid spins around the center.  The polymer chain is not be deformed by this flow, but merely rotates. | a = -1 Rigid Rotation |
| This flow lies in between rigid rotation and steady shear flow.  The stream lines are elliptical in shape.  There is a mixture of shearing deformation and rotation causing the polymer to deform and rotate.  This is a weak flow and does not change the shape of the polymer chain greatly. | a = -0.5 Elliptical Flow |
| This flow consists of flat sheets of fluid moving in the x-direction.  The rate of motion is proportional to the distance from the center in the y-direction.  The streamlines are horizontal straight lines that become closer together as the flow speeds up.  This flow has both deformation and rotation in equal proportions so that the polymer molecule is stretched and tumbled by the flow. | a = 0 Shear Flow |
| This flow consists of bent sheets of fluid moving in the x-direction at large distances.  The fluid comes in from the top and bottom and flows out the sides.  The deformation is now stronger than the rotation in the flow.  The polymer chains become oriented in the x-direction and tumble less often than for smaller values of the flow-type parameter. | a = 0.5 Hyperbolic Flow |
| The streamlines are sets of rectangular hyperbolas.  The flow is purely deformation and no rotation.  The flow comes in the top and bottom and flows out the sides.  This is a very strong flow and will cause the chain to be pulled in the x-direction and some times pulling the polymer chain completely apart.  The alignment of the polymer chain is very strong and the chain will seldom tumble. | a = 1 Planar Elongational Flow |
